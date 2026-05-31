import { Injectable, HttpException } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { DataBaseService, WindowsService } from '@/modules/database/database.service'
import { SystemService } from '@web-datetask-server/modules/system/system.service'
import { OmixRequest } from '@/interface'
import { firstValueFrom } from 'rxjs'
import { moment } from '@/utils'

@Injectable()
export class ExchangeService extends Logger {
    /**任务处理器标识**/
    public readonly taskName: string = 'datetask-sync-exchange-rate'

    constructor(
        private readonly database: DataBaseService,
        private readonly windows: WindowsService,
        private readonly httpService: HttpService,
        private readonly systemService: SystemService
    ) {
        super()
    }

    /**获取金额费率**/
    @AutoDescriptor
    private async fetchBaseFrankfurter(request: OmixRequest, body: Omix) {
        return await firstValueFrom(
            this.httpService.get<Array<Omix>>(`https://api.frankfurter.dev/v2/rates`, {
                params: { from: body.date, to: body.date, base: 'USD' }
            })
        ).then(({ data }) => {
            if ((data ?? []).length === 0) {
                return []
            } else if (!(data ?? []).some(e => e.quote === 'USD' && e.base === 'USD')) {
                data.push({ date: body.date, base: 'USD', quote: 'USD', rate: 1 })
            }
            this.logger.info(`汇率数据拉取成功，日期: ${body.date}，总计 ${(data ?? []).length} 条`)
            return data
        })
    }

    /**初始化费率定时任务**/
    @AutoDescriptor
    public async fetchInitEventRegister(request?: OmixRequest) {
        /**注册系统任务定义**/
        return await this.systemService.fetchBaseEnsureSystemTask(request, {
            handler: this.taskName,
            taskName: `汇率同步定时任务`,
            comment: '定时从Frankfurter获取汇率数据并更新数据库',
            cron: '0 0 * * *'
        })
    }

    /**费率定时任务执行器**/
    @AutoDescriptor
    public async fetchBaseTaskActuator(request: OmixRequest, state: Omix) {
        try {
            const date = state.date ?? moment().format('YYYY-MM-DD')
            const bank = await this.fetchBaseFrankfurter(request, { date })
            return await this.database.builder(this.windows.currencyOptions, async qb => {
                return await qb.getMany().then(async items => {
                    const alls = new Set(items.map(c => c.currency))
                    /**3.过滤出需要同步的币种**/
                    const toSync = bank.filter((item: Omix) => alls.has(item.quote))
                    if (toSync.length === 0) {
                        return { skipped: 0, synced: 0, total: 0, message: `同步完成: 写入 0 条，跳过 0 条，总计 0 条` }
                    }
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
                    this.logger.info(
                        `同步完成: 写入 ${list.length} 条，跳过 ${skipped} 条，总计 ${toSync.length} 条，数据列表: ${JSON.stringify(list)}`
                    )
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
            throw new HttpException(err.message, err.status, {
                description: err.message,
                cause: {
                    synced: 0,
                    skipped: 0,
                    total: 0,
                    message: `获取国际费率失败：${err.message}`
                }
            })
        }
    }
}
