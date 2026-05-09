import { Injectable } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { enums } from '@/modules/database/database.service'
import { DatetaskSystemProcessor } from '@web-datetask-server/modules/datetask/datetask-system.processor'
import { DatetaskService } from '@web-datetask-server/modules/datetask/datetask.service'
import { ExchangeUtilsService } from '@web-datetask-server/modules/exchange/exchange.utils.service'
import { OmixRequest } from '@/interface'
import { moment } from '@/utils'

@Injectable()
export class ExchangeService extends Logger {
    private readonly taskName: string = 'datetask-sync-exchange-rate'

    constructor(
        private readonly datetaskSystemProcessor: DatetaskSystemProcessor,
        private readonly datetaskService: DatetaskService,
        private readonly exchangeUtilsService: ExchangeUtilsService
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
            cron: '30 8 * * *',
            // cron: '*/30 * * * * *',
            type: enums.CHUNK_DATETASK_TYPE.system.value
        })
        /**注册处理器**/
        return this.datetaskSystemProcessor.fetchRegisterHandler(this.taskName, data => {
            return this.exchangeUtilsService.fetchBaseRatesByFrankfurter(request, {
                date: moment().format('YYYY-MM-DD')
            })
        })
    }
}
