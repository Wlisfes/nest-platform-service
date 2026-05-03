import { Injectable, OnModuleInit } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { HttpService } from '@nestjs/axios'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { DataBaseService, WindowsService } from '@/modules/database/database.service'
import { firstValueFrom } from 'rxjs'

@Injectable()
export class ExchangeService extends Logger implements OnModuleInit {
    constructor(
        private readonly database: DataBaseService,
        private readonly windows: WindowsService,
        private readonly httpService: HttpService
    ) {
        super()
    }

    /**应用启动后执行一次同步**/
    async onModuleInit() {
        await this.syncExchangeRates().catch(err => {
            this.logger.error(`[ExchangeService] 启动同步汇率失败: ${err.message}`)
        })
    }

    /**每天 08:00 自动同步汇率**/
    @Cron('0 0 8 * * *')
    async handleCronSyncExchangeRates() {
        this.logger.info('[CurrencySchedule] 定时同步汇率任务开始')
        await this.syncExchangeRates().catch(err => {
            this.logger.error(`[CurrencySchedule] 定时同步汇率失败: ${err.message}`)
        })
    }

    /**同步汇率核心逻辑**/
    @AutoDescriptor
    public async syncExchangeRates() {
        /**1. 从 Frankfurter API 获取基于 USD 的最新汇率**/
        const { data } = await firstValueFrom(
            this.httpService.get<{
                base: string
                date: string
                rates: Record<string, number>
            }>('https://api.frankfurter.dev/v1/latest?base=USD')
        )
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
                    rate,
                    date: data.date
                })
                synced++
            } catch (err) {
                this.logger.error(`[CurrencySchedule] 写入 ${currency} 汇率失败: ${err.message}`)
            }
        }

        this.logger.info(`[CurrencySchedule] 同步完成: 写入 ${synced} 条, 跳过 ${skipped} 条, 总计 ${toSync.length} 条`)
        return { synced, skipped, total: toSync.length }
    }
}
