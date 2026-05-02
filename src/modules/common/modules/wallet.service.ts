import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { RedisService } from '@/modules/redis/redis.service'
import { DataBaseService } from '@/modules/database/database.service'
import { WindowsClient } from '@/modules/database/schema/modules/tb_windows_client'
import { WINDOWS_WALLET_BILL_TYPE } from '@/modules/database/enums'
import { RabbitmqService } from '@/modules/rabbitmq/rabbitmq.service'
import { OmixRequest } from '@/interface'

@Injectable()
export class WalletService extends Logger {
    /**金额缓存前缀**/
    protected readonly keyName: string = `windows:common-wallet:{clientId}`

    constructor(
        private readonly redisService: RedisService,
        private readonly dbService: DataBaseService,
        private readonly rabbitmqService: RabbitmqService
    ) {
        super()
    }

    /**
     * 同步客户余额到 Redis
     * @param clientId 客户ID
     */
    @AutoDescriptor
    public async syncClientBalanceToRedis(request: OmixRequest, clientId: number): Promise<number> {
        return await this.dbService.transaction<['WindowsClient']>({ schema: ['WindowsClient'] }).then(async query => {
            const client = await query.WindowsClient.findOne({ where: { keyId: clientId } })
            if (!client) {
                throw new HttpException('客户不存在', HttpStatus.BAD_REQUEST)
            }
            // 计算可用余额：balance + credit
            const availableBalance = Number(client.balance) + Number(client.credit)
            const redisKey = await this.redisService.compose(request, this.keyName, { clientId })

            // 写入 Redis，默认缓存 24 小时
            await this.redisService.setStore(request, {
                key: redisKey,
                data: availableBalance,
                seconds: 86400,
                logger: false
            })

            return availableBalance
        })
    }

    /**
     * 高频扣费 (预扣费)
     * 利用 Redis Lua 脚本保证原子性，绝不透支
     */
    @AutoDescriptor
    public async deduct(
        request: OmixRequest,
        clientId: number,
        changeType: string,
        amount: number,
        taskId?: number,
        remark?: string
    ): Promise<boolean> {
        if (amount <= 0) throw new HttpException('扣费金额必须大于0', HttpStatus.BAD_REQUEST)

        const redisKey = await this.redisService.compose(request, this.keyName, { clientId })
        let currentBalance = await this.redisService.getStore<number>(request, { key: redisKey, defaultValue: null })

        // 如果 Redis 中没有缓存，先同步
        if (currentBalance === null) {
            currentBalance = await this.syncClientBalanceToRedis(request, clientId)
        }

        // Lua 脚本：原子校验并扣除
        const luaScript = `
            local balance = redis.call("GET", KEYS[1])
            if not balance then
                return -1
            end
            if tonumber(balance) >= tonumber(ARGV[1]) then
                local new_balance = redis.call("DECRBY", KEYS[1], tonumber(ARGV[1]))
                return tonumber(new_balance)
            else
                return -2
            end
        `

        const result = await this.redisService.evalStore(request, {
            script: luaScript,
            keys: [redisKey],
            args: [amount.toString()]
        })

        if (result === -1) {
            // 缓存突然失效，重试一次
            await this.syncClientBalanceToRedis(request, clientId)
            return this.deduct(request, clientId, changeType, amount, taskId, remark)
        }

        if (result === -2) {
            throw new HttpException('可用余额不足', HttpStatus.BAD_REQUEST)
        }

        // 扣费成功后，将流水数据异步投递到 MQ 进行聚合落库
        // TODO: 接入项目实际的 RabbitMQ 生产者
        const logData = {
            clientId,
            taskId,
            changeType,
            billType: WINDOWS_WALLET_BILL_TYPE.deduct.value,
            amount,
            remark,
            afterBalance: Number(result)
        }
        await this.rabbitmqService.fetchDespatch(request, 'wallet_exchange', 'wallet.consume', logData)
        this.logger.info({ message: '异步投递扣费流水至 MQ', data: logData })

        return true
    }

    /**
     * 失败退返
     */
    @AutoDescriptor
    public async refund(
        request: OmixRequest,
        clientId: number,
        changeType: string,
        amount: number,
        taskId?: number,
        remark?: string
    ): Promise<boolean> {
        if (amount <= 0) throw new HttpException('退款金额必须大于0', HttpStatus.BAD_REQUEST)

        const redisKey = await this.redisService.compose(request, this.keyName, { clientId })

        // 尝试执行增加操作
        const luaScript = `
            local balance = redis.call("GET", KEYS[1])
            if balance then
                return tonumber(redis.call("INCRBY", KEYS[1], tonumber(ARGV[1])))
            else
                return -1
            end
        `
        const result = await this.redisService.evalStore(request, {
            script: luaScript,
            keys: [redisKey],
            args: [amount.toString()]
        })

        if (result === -1) {
            // 如果缓存不存在，同步一次DB即可，不需要再加内存，因为DB里的就是准确的退款前金额
            await this.syncClientBalanceToRedis(request, clientId)
        }

        // 异步投递流水记录
        const logData = {
            clientId,
            taskId,
            changeType,
            billType: WINDOWS_WALLET_BILL_TYPE.refund.value,
            amount,
            remark
        }
        await this.rabbitmqService.fetchDespatch(request, 'wallet_exchange', 'wallet.consume', logData)
        this.logger.info({ message: '异步投递退款流水至 MQ', data: logData })

        return true
    }

    /**
     * 充值 (低频操作，直接走DB原子更新并清理缓存)
     */
    @AutoDescriptor
    public async topUp(request: OmixRequest, clientId: number, rechargeType: string, amount: number, remark?: string): Promise<boolean> {
        if (amount <= 0) throw new HttpException('充值金额必须大于0', HttpStatus.BAD_REQUEST)

        await this.dbService
            .transaction<['WindowsClient', 'WindowsWalletRecharge']>({
                schema: ['WindowsClient', 'WindowsWalletRecharge']
            })
            .then(async query => {
                const client = await query.WindowsClient.findOne({ where: { keyId: clientId } })
                if (!client) {
                    throw new HttpException('客户不存在', HttpStatus.BAD_REQUEST)
                }

                const beforeBalance = Number(client.balance)
                const afterBalance = beforeBalance + amount

                // 原子更新 DB
                await query.WindowsClient.createQueryBuilder()
                    .update(WindowsClient)
                    .set({ balance: () => `balance + ${amount}` })
                    .where('key_id = :id', { id: clientId })
                    .execute()

                // 同步写入充值流水表
                const log = query.WindowsWalletRecharge.create({
                    clientId,
                    rechargeType,
                    amount,
                    beforeBalance,
                    afterBalance,
                    remark
                })
                await query.WindowsWalletRecharge.save(log)

                // 清理缓存强制下次读DB
                const redisKey = await this.redisService.compose(request, this.keyName, { clientId })
                await this.redisService.delStore(request, { key: redisKey })
            })

        return true
    }

    /**
     * MQ 消费者：批量聚合写入消费表 DB (防止单点击穿)
     * 供 MQ Consumer 订阅到扣费/退款数据后调用
     */
    @AutoDescriptor
    public async consumeWalletLogBatch(
        request: OmixRequest,
        logs: Array<{
            clientId: number
            taskId?: number
            changeType: string
            billType: string
            amount: number
            remark?: string
        }>
    ): Promise<boolean> {
        if (!logs || logs.length === 0) return true

        await this.dbService
            .transaction<['WindowsClient', 'WindowsWalletConsume']>({
                schema: ['WindowsClient', 'WindowsWalletConsume']
            })
            .then(async query => {
                // 1. 批量插入消费流水
                const logEntities = logs.map(log =>
                    query.WindowsWalletConsume.create({
                        clientId: log.clientId,
                        taskId: log.taskId,
                        changeType: log.changeType,
                        billType: log.billType,
                        amount: log.amount,
                        remark: log.remark
                    })
                )
                // 使用 typeorm 的 save 支持批量
                await query.WindowsWalletConsume.save(logEntities)

                // 2. 按 client 聚合要变动的总金额
                // 扣费减少余额，退款增加余额
                const clientBalanceChange = new Map<number, number>()
                for (const log of logs) {
                    let change = 0
                    if (log.billType === WINDOWS_WALLET_BILL_TYPE.deduct.value) {
                        change = -log.amount
                    } else if (log.billType === WINDOWS_WALLET_BILL_TYPE.refund.value) {
                        change = log.amount
                    }

                    if (change !== 0) {
                        const current = clientBalanceChange.get(log.clientId) || 0
                        clientBalanceChange.set(log.clientId, current + change)
                    }
                }

                // 3. 循环 UPDATE 更新涉及的 client
                // 因为批量聚合的数量远小于逐条单笔，极大地降低了行锁竞争
                for (const [id, diff] of clientBalanceChange.entries()) {
                    if (diff !== 0) {
                        const sign = diff > 0 ? '+' : '-'
                        const absDiff = Math.abs(diff)
                        await query.WindowsClient.createQueryBuilder()
                            .update(WindowsClient)
                            .set({ balance: () => `balance ${sign} ${absDiff}` })
                            .where('key_id = :id', { id })
                            .execute()
                    }
                }
            })

        return true
    }
}
