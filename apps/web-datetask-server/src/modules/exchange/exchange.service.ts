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
        await this.datetaskService.fetchBaseEnsureSystemTask(request, {
            handler: this.taskName,
            taskName: `汇率同步定时任务`,
            comment: '定时从Frankfurter获取汇率数据并更新数据库',
            // cron: '0 0 0 * * *',
            cron: '*/10 * * * * *',
            type: enums.CHUNK_DATETASK_TYPE.system.value
        })
        /**注册处理器**/
        return this.datetaskProcessor.fetchRegisterHandler(this.taskName, async data => {
            // return this.httpBaseRatesByFrankfurter()

            console.log(data)

            return {}
        })
    }

    /**获取国际费率**/
    @AutoDescriptor
    public async httpBaseRatesByFrankfurter(request?: OmixRequest) {
        try {
            /**1.从 Frankfurter API 获取基于 USD 的最新汇率**/
            const date = moment().format('YYYY-MM-DD')
            const { data } = await firstValueFrom(
                this.httpService.get<Array<Omix>>(`https://api.frankfurter.dev/v2/rates`, {
                    params: { from: date, to: date, base: 'USD' }
                })
            )
            this.logger.info(`汇率数据拉取成功，日期: ${date}，总计 ${(data ?? []).length} 条`)
            /**2.查询系统中所有已配置的币种列表**/
            return await this.database.builder(this.windows.currencyOptions, async qb => {
                return await qb.getMany().then(async items => {
                    const alls = new Set(items.map(c => c.currency))
                    /**3.过滤出需要同步的币种**/
                    const toSync = (data ?? []).filter((item: Omix) => alls.has(item.quote))
                    /**4.一次性查询已存在的记录，批量插入新记录**/
                    const existingRecords = await this.database.builder(this.windows.currencyExchangeOptions, async qb => {
                        qb.where(`t.date = :date`, { date })
                        qb.andWhere(`t.currency IN (:...currencys)`, { currencys: toSync.map((item: Omix) => item.quote) })
                        return await qb.getMany()
                    })
                    const existingSet = new Set(existingRecords.map((r: Omix) => `${r.currency}_${r.date}`))
                    const filters = toSync.filter((item: Omix) => !existingSet.has(`${item.quote}_${item.date}`))
                    const list = filters.map((item: Omix) => ({ currency: item.quote, rate: Number(item.rate), date: item.date }))
                    const skipped = toSync.length - list.length
                    if (list.length > 0) {
                        await this.windows.currencyExchangeOptions.save(list)
                    }
                    this.logger.info({
                        message: `同步完成: 写入 ${list.length} 条，跳过 ${skipped} 条，总计 ${toSync.length} 条`,
                        data: list
                    })
                    return {
                        skipped,
                        synced: list.length,
                        total: toSync.length,
                        message: `同步完成: 写入 ${list.length} 条，跳过 ${skipped} 条，总计 ${toSync.length} 条`
                    }
                })
            })
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
