import { Injectable } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { DataBaseService, WindowsService } from '@/modules/database/database.service'
import { isNotEmpty } from '@/utils'
import { OmixRequest } from '@/interface'
import * as windows from '@web-windows-server/interface'

@Injectable()
export class FinanceCurrencyUtilsService extends Logger {
    constructor(private readonly database: DataBaseService, private readonly windows: WindowsService) {
        super()
    }

    /**根据keyId查询币种信息**/
    @AutoDescriptor
    public async fetchUtilsByKeyIdCurrency(request: OmixRequest, body: Omix<{ keyId: number }>) {
        return await this.database.empty(this.windows.currencyOptions, {
            request,
            message: 'keyId:不存在',
            dispatch: { where: { keyId: body.keyId } }
        })
    }

    /**批量查询币种**/
    @AutoDescriptor
    public async fetchUtilsByColumnCurrency(request: OmixRequest, body: windows.UtilsByColumnCurrencyOptions) {
        if (body.keyIds.length === 0) {
            return []
        }
        return await this.database.builder(this.windows.currencyOptions, async qb => {
            if (body.fields && body.fields.length > 0) {
                qb.select([...new Set(['t.keyId', ...body.fields.map(f => `t.${f}`)])])
            }
            qb.where(`t.keyId IN (:...keyIds)`, { keyIds: [...new Set(body.keyIds.filter(isNotEmpty))] })
            return await qb.getMany()
        })
    }

    /**根据币种编码查询币种信息**/
    @AutoDescriptor
    public async fetchUtilsByCurrencyCode(request: OmixRequest, body: Omix<{ currency: string }>) {
        return await this.database.empty(this.windows.currencyOptions, {
            request,
            message: '币种不存在',
            dispatch: { where: { currency: body.currency } }
        })
    }

    /**查询币种最新汇率**/
    @AutoDescriptor
    public async fetchUtilsLatestExchangeRate(request: OmixRequest, body: Omix<{ currency: string }>) {
        return await this.windows.currencyExchangeOptions.findOne({
            where: { currency: body.currency },
            order: { date: 'DESC' }
        })
    }

    /**查询币种指定日期汇率**/
    @AutoDescriptor
    public async fetchUtilsExchangeRateByDate(request: OmixRequest, body: Omix<{ currency: string; date: string }>) {
        return await this.windows.currencyExchangeOptions.findOne({
            where: { currency: body.currency, date: body.date }
        })
    }
}
