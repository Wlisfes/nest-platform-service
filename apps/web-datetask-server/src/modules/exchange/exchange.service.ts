import { Injectable } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { DataBaseService, WindowsService } from '@/modules/database/database.service'
import { firstValueFrom } from 'rxjs'
import { OmixRequest } from '@/interface'

@Injectable()
export class ExchangeService extends Logger {
    constructor(
        private readonly database: DataBaseService,
        private readonly windows: WindowsService,
        private readonly httpService: HttpService
    ) {
        super()
    }

    /**同步汇率核心逻辑**/
    @AutoDescriptor
    public async processSyncExchangeRates(request: Request) {}

    /**同步汇率核心逻辑**/
    @AutoDescriptor
    public async fetchSyncExchangeRates(request: Request) {
        /**1. 从 Frankfurter API 获取基于 USD 的最新汇率**/
        let data: any
        try {
            const response = await firstValueFrom(this.httpService.get('https://api.frankfurter.dev/v2/rates?base=USD'))
            data = response.data
            console.log(data)
        } catch (error) {
            this.logger.error(`[ExchangeService] 汇率数据拉取失败: ${error.message}`)
            return {
                synced: 0,
                skipped: 0,
                total: 0,
                message: `汇率数据拉取失败: ${error.message}`
            }
        }
        this.logger.info(`[ExchangeService] 获取到 ${Object.keys(data.rates).length} 个币种汇率, 日期: ${data.date}`)

        /**2. 查询系统中所有已配置的币种列表**/
        const allCurrencies = await this.database.builder(this.windows.currencyOptions, async qb => {
            return await qb.getMany()
        })
        const currencyCodes = new Set(allCurrencies.map(c => c.currency))

        /**3. 过滤出需要同步的币种（API 返回 ∩ 系统配置）**/
        const toSync = Object.entries(data.rates).filter(([code]) => currencyCodes.has(code))

        /**4. 批量写入，先查后插保证幂等**/
        let synced = 0
        let skipped = 0
        for (const [currency, rate] of toSync) {
            try {
                const exists = await this.database.builder(this.windows.currencyExchangeOptions, async qb => {
                    qb.where(`t.currency = :currency AND t.date = :date`, { currency, date: data.date })
                    return await qb.getOne()
                })
                if (exists) {
                    skipped++
                    continue
                }
                await this.windows.currencyExchangeOptions.save({
                    currency,
                    rate: Number(rate),
                    date: data.date
                })
                synced++
            } catch (err) {
                this.logger.error(`[ExchangeService] 写入 ${currency} 汇率失败: ${err.message}`)
            }
        }

        this.logger.info(`[ExchangeService] 同步完成: 写入 ${synced} 条, 跳过 ${skipped} 条, 总计 ${toSync.length} 条`)
        return {
            synced,
            skipped,
            total: toSync.length,
            message: `同步完成: 写入 ${synced} 条, 跳过 ${skipped} 条, 总计 ${toSync.length} 条`
        }
    }
}
