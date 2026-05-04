import { Injectable } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { DataBaseService, WindowsService, enums } from '@/modules/database/database.service'
import { DatetaskProcessor } from '@web-datetask-server/modules/datetask/datetask.processor'
import { DatetaskService } from '@web-datetask-server/modules/datetask/datetask.service'
import { firstValueFrom } from 'rxjs'
import { moment } from '@/utils'
import { OmixRequest } from '@/interface'

@Injectable()
export class ExchangeService extends Logger {
    private readonly taskName: string = 'datetask-sync-exchange-rate'

    constructor(
        private readonly database: DataBaseService,
        private readonly windows: WindowsService,
        private readonly httpService: HttpService,
        private readonly datetaskProcessor: DatetaskProcessor,
        private readonly datetaskService: DatetaskService
    ) {
        super()
    }

    /**初始化费率事件**/
    @AutoDescriptor
    public async fetchInitEventRegister(request?: OmixRequest) {
        /**注册系统任务定义**/
        // await this.datetaskService.fetchBaseEnsureSystemTask(request, {
        //     handler: this.taskName,
        //     taskName: `汇率同步定时任务`,
        //     comment: '定时从Frankfurter获取汇率数据并更新数据库',
        //     cron: '0 0 0 * * *',
        //     type: enums.CHUNK_DATETASK_TYPE.system.value
        // })
        /**注册处理器**/
        // return this.datetaskProcessor.fetchRegisterHandler(this.taskName, () => {
        //     return this.httpBaseRatesByFrankfurter(undefined)
        // })
        return this.httpBaseRatesByFrankfurter(undefined)
    }

    /**获取国际费率**/
    @AutoDescriptor
    public async httpBaseRatesByFrankfurter(request: OmixRequest) {
        try {
            /**1. 从 Frankfurter API 获取基于 USD 的最新汇率**/
            const { data } = await firstValueFrom(
                this.httpService.get<Array<Omix>>(`https://api.frankfurter.dev/v2/rates`, {
                    params: { from: moment().format('YYYY-MM-DD'), to: moment().format('YYYY-MM-DD'), base: 'USD' }
                })
            )
            this.logger.info({ message: `汇率数据拉取成功, 日期: ${moment().format('YYYY-MM-DD')}，`, data })
            /**查询系统中所有已配置的币种列表**/
            const allCurrencies = await this.database.builder(this.windows.currencyOptions, async qb => {
                return await qb.getMany()
            })
            const currencyCodes = new Set(allCurrencies.map(c => c.currency))
            /**3. 过滤出需要同步的币种（API 返回 ∩ 系统配置）**/
            const toSync = (data ?? []).filter((item: Omix) => currencyCodes.has(item.quote))
            /**4. 一次性查询已存在的记录，批量插入新记录**/
            const existingRecords = await this.database.builder(this.windows.currencyExchangeOptions, async qb => {
                qb.where(`t.date = :date`, { date: toSync[0]?.date })
                qb.andWhere(`t.currency IN (:...currencies)`, { currencies: toSync.map((item: Omix) => item.quote) })
                return await qb.getMany()
            })
            // const existingSet = new Set(existingRecords.map((r: Omix) => `${r.currency}_${r.date}`))
            // const filters = toSync.filter((item: Omix) => !existingSet.has(`${item.quote}_${item.date}`))
            // const items = filters.map((item: Omix) => ({ currency: item.quote, rate: Number(item.rate), date: item.date }))
            // const skipped = toSync.length - items.length
            // if (items.length > 0) {
            //     await this.windows.currencyExchangeOptions.save(items)
            // }
            // this.logger.info(`同步完成: 写入 ${items.length} 条, 跳过 ${skipped} 条, 总计 ${toSync.length} 条`)
            // return {
            //     synced: items.length,
            //     skipped,
            //     total: toSync.length,
            //     message: `同步完成: 写入 ${items.length} 条, 跳过 ${skipped} 条, 总计 ${toSync.length} 条`
            // }
        } catch (err) {
            this.logger.error(`获取国际费率失败：${err.message}`)
            return {
                synced: 0,
                skipped: 0,
                total: 0,
                message: `获取国际费率失败：${err.message}`
            }
        }
    }
}
