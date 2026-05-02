import { Injectable, OnModuleDestroy } from '@nestjs/common'
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq'
import { Logger } from '@/modules/logger/logger.service'
import { DataBaseService } from '@/modules/database/database.service'
import { WindowsClient } from '@/modules/database/schema/modules/tb_windows_client'
import { WINDOWS_WALLET_BILL_TYPE } from '@/modules/database/enums'

@Injectable()
export class AppWalletService extends Logger implements OnModuleDestroy {
    private buffer: any[] = []
    private timer: NodeJS.Timeout | null = null
    // 最大缓冲数量，达到该数量立刻落库
    private readonly MAX_BUFFER_SIZE = 100
    // 最大缓冲时间，避免少量日志一直不落库
    private readonly FLUSH_INTERVAL_MS = 2000
    private isFlushing = false

    constructor(private readonly dbService: DataBaseService) {
        super()
    }

    /**自定义消息消费者**/
    @RabbitSubscribe({
        exchange: 'windows-wallet-consume',
        routingKey: 'windows-wallet-consume.*',
        queue: 'windows-wallet-consume.messager',
        queueOptions: {
            durable: true
        }
    })
    public async fetchWalletConsumeMessager(msg: any) {
        if (!msg) return

        this.buffer.push(msg)

        if (this.buffer.length >= this.MAX_BUFFER_SIZE) {
            this.flushBuffer()
        } else if (!this.timer) {
            this.timer = setTimeout(() => this.flushBuffer(), this.FLUSH_INTERVAL_MS)
        }
    }

    /**批量落库逻辑**/
    private async flushBuffer() {
        if (this.isFlushing || this.buffer.length === 0) return
        this.isFlushing = true

        if (this.timer) {
            clearTimeout(this.timer)
            this.timer = null
        }

        // 取出当前所有缓存，清空原数组接收新消息
        const logsToProcess = [...this.buffer]
        this.buffer = []

        try {
            await this.consumeWalletLogBatch(logsToProcess)
            this.logger.info({ message: `批量落地钱包消费流水成功，本次聚合数量: ${logsToProcess.length}` })
        } catch (error) {
            this.logger.error({ message: '批量落地钱包消费流水失败，进行数据回退重试', error })
            // 发生错误时，将未处理完的数据重新加回 buffer 开头，等待下一次重试 (简单的错误恢复)
            this.buffer = [...logsToProcess, ...this.buffer]
        } finally {
            this.isFlushing = false
            // 恢复监听，如果由于刚才报错或新消息进来达到了条件，继续触发
            if (this.buffer.length >= this.MAX_BUFFER_SIZE) {
                this.flushBuffer()
            } else if (this.buffer.length > 0 && !this.timer) {
                this.timer = setTimeout(() => this.flushBuffer(), this.FLUSH_INTERVAL_MS)
            }
        }
    }

    /**
     * 批量聚合写入消费表 DB (防止单点击穿)
     */
    private async consumeWalletLogBatch(logs: Array<Omix>): Promise<boolean> {
        if (!logs || logs.length === 0) return true
        const query = await this.dbService.transaction({
            schema: ['WindowsClient', 'WindowsWalletConsume']
        })

        // 1. 批量插入消费流水
        const logEntities = logs.map(log =>
            query.WindowsWalletConsume.create({
                clientId: log.clientId,
                businessId: log.businessId,
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
                    .set({ balanceUsd: () => `balance_usd ${sign} ${absDiff}` })
                    .where('key_id = :id', { id })
                    .execute()
            }
        }

        return true
    }

    onModuleDestroy() {
        if (this.timer) {
            clearTimeout(this.timer)
        }
        if (this.buffer.length > 0) {
            this.flushBuffer()
        }
    }
}
