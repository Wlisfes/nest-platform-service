import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { DataBaseService, WindowsService, schema, enums } from '@/modules/database/database.service'
import { isNotEmpty } from '@/utils'
import { OmixRequest } from '@/interface'
import * as windows from '@web-windows-server/interface'

/**金额放大倍数**/
const AMOUNT_SCALE = 1_000_000

@Injectable()
export class FinanceClientService extends Logger {
    constructor(private readonly database: DataBaseService, private readonly windows: WindowsService) {
        super()
    }

    /**新增客户**/
    @AutoDescriptor
    public async httpBaseFinanceCreateClient(request: OmixRequest, body: windows.CreateClientOptions) {
        const ctx = await this.database.transaction()
        try {
            const node = ctx.manager.getRepository(schema.WindowsClient).create({
                name: body.name,
                alias: body.alias,
                brandId: body.brandId,
                currency: body.currency,
                email: body.email,
                phone: body.phone,
                status: body.status ?? enums.CHUNK_CLIENT_STATUS.enable.value,
                payMode: body.payMode,
                authStatus: body.authStatus ?? enums.CHUNK_CLIENT_AUTH_STATUS.unverified.value,
                source: body.source ?? enums.CHUNK_CLIENT_SOURCE.manual.value,
                remark: body.remark
            })
            await ctx.manager.getRepository(schema.WindowsClient).save(node)
            return await ctx.commitTransaction().then(async () => {
                return await this.fetchResolver({ message: '操作成功' })
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        } finally {
            await ctx.release()
        }
    }

    /**编辑客户**/
    @AutoDescriptor
    public async httpBaseFinanceUpdateClient(request: OmixRequest, body: windows.UpdateClientOptions) {
        const ctx = await this.database.transaction()
        try {
            /**验证客户存在**/
            await this.database.empty(this.windows.clientOptions, {
                request,
                message: 'keyId:不存在',
                dispatch: { where: { keyId: body.keyId } }
            })
            await this.database.update(ctx.manager.getRepository(schema.WindowsClient), {
                request,
                stack: this.stack,
                where: { keyId: body.keyId },
                body: {
                    name: body.name,
                    alias: body.alias,
                    brandId: body.brandId,
                    currency: body.currency,
                    email: body.email,
                    phone: body.phone,
                    payMode: body.payMode,
                    remark: body.remark
                }
            })
            return await ctx.commitTransaction().then(async () => {
                return await this.fetchResolver({ message: '操作成功' })
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        } finally {
            await ctx.release()
        }
    }

    /**分页列表查询**/
    @AutoDescriptor
    public async httpBaseFinanceColumnClient(request: OmixRequest, body: windows.ColumnClientOptions) {
        try {
            return await this.database.builder(this.windows.clientOptions, async qb => {
                if (isNotEmpty(body.name)) {
                    qb.andWhere(`t.name LIKE :name`, { name: `%${body.name}%` })
                }
                if (isNotEmpty(body.status)) {
                    qb.andWhere(`t.status = :status`, { status: body.status })
                }
                if (isNotEmpty(body.brandId)) {
                    qb.andWhere(`t.brandId = :brandId`, { brandId: body.brandId })
                }
                if (isNotEmpty(body.currency)) {
                    qb.andWhere(`t.currency = :currency`, { currency: body.currency })
                }
                if (isNotEmpty(body.payMode)) {
                    qb.andWhere(`t.payMode = :payMode`, { payMode: body.payMode })
                }
                if (isNotEmpty(body.authStatus)) {
                    qb.andWhere(`t.authStatus = :authStatus`, { authStatus: body.authStatus })
                }
                if (isNotEmpty(body.source)) {
                    qb.andWhere(`t.source = :source`, { source: body.source })
                }
                qb.orderBy('t.createTime', 'DESC')
                qb.skip((body.page - 1) * body.size)
                qb.take(body.size)
                return await qb.getManyAndCount().then(async ([list, total]) => {
                    const converted = list.map(item => ({
                        ...item,
                        balance: Number(item.balance) / AMOUNT_SCALE,
                        credit: Number(item.credit) / AMOUNT_SCALE
                    }))
                    return await this.fetchResolver({ page: body.page, size: body.size, total, list: converted })
                })
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        }
    }

    /**状态修改**/
    @AutoDescriptor
    public async httpBaseFinanceUpdateClientStatus(request: OmixRequest, body: windows.UpdateClientStatusOptions) {
        const ctx = await this.database.transaction()
        try {
            /**验证客户存在**/
            await this.database.empty(this.windows.clientOptions, {
                request,
                message: 'keyId:不存在',
                dispatch: { where: { keyId: body.keyId } }
            })
            await this.database.update(ctx.manager.getRepository(schema.WindowsClient), {
                request,
                stack: this.stack,
                where: { keyId: body.keyId },
                body: { status: body.status }
            })
            return await ctx.commitTransaction().then(async () => {
                return await this.fetchResolver({ message: '操作成功' })
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        } finally {
            await ctx.release()
        }
    }
}
