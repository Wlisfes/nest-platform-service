import { Injectable, HttpException } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { DataBaseService, WindowsService, schema, enums } from '@/modules/database/database.service'
import { isNotEmpty } from '@/utils'
import { OmixRequest } from '@/interface'
import * as windows from '@web-windows-server/interface'

@Injectable()
export class CurrencyService extends Logger {
    constructor(private readonly database: DataBaseService, private readonly windows: WindowsService) {
        super()
    }

    /**分页列表查询**/
    @AutoDescriptor
    public async httpBaseFinanceColumnCurrency(request: OmixRequest, body: windows.ColumnCurrencyOptions) {
        try {
            return await this.database.builder(this.windows.currencyOptions, async qb => {
                if (isNotEmpty(body.name)) {
                    qb.andWhere(`t.name LIKE :name`, { name: `%${body.name}%` })
                }
                if (isNotEmpty(body.status)) {
                    qb.andWhere(`t.status = :status`, { status: body.status })
                }
                qb.orderBy('t.createTime', 'DESC')
                qb.skip((body.page - 1) * body.size)
                qb.take(body.size)
                return await qb.getManyAndCount().then(async ([list, total]) => {
                    return await this.fetchResolver({ page: body.page, size: body.size, total, list })
                })
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        }
    }

    /**状态修改**/
    @AutoDescriptor
    public async httpBaseFinanceUpdateCurrencyStatus(request: OmixRequest, body: windows.UpdateCurrencyStatusOptions) {
        const ctx = await this.database.transaction()
        try {
            /**验证币种存在**/
            await this.database.empty(this.windows.currencyOptions, {
                request,
                message: 'keyId:不存在',
                dispatch: { where: { keyId: body.keyId } }
            })
            await this.database.update(ctx.manager.getRepository(schema.WindowsCurrency), {
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

    /**币种下拉列表（启用状态）**/
    @AutoDescriptor
    public async httpBaseFinanceSelectCurrency(request: OmixRequest) {
        try {
            return await this.database.builder(this.windows.currencyOptions, async qb => {
                qb.andWhere(`t.status = :status`, { status: enums.CHUNK_CURRENCY_STATUS.enable.value })
                qb.orderBy('t.createTime', 'DESC')
                return await qb.getMany().then(async list => {
                    return await this.fetchResolver({ list })
                })
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        }
    }
}
