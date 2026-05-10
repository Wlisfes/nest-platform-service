import { Injectable } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { enums } from '@/modules/database/database.service'
import { DatetaskSystemService } from '@web-datetask-server/modules/datetask/datetask-system.service'
import { ExchangeUtilsService } from '@web-datetask-server/modules/exchange/exchange.utils.service'
import { OmixRequest } from '@/interface'

@Injectable()
export class ExchangeService extends Logger {
    constructor(
        private readonly exchangeUtilsService: ExchangeUtilsService,
        private readonly datetaskSystemService: DatetaskSystemService
    ) {
        super()
    }

    /**初始化费率事件**/
    @AutoDescriptor
    public async fetchInitEventRegister(request?: OmixRequest) {
        /**注册系统任务定义**/
        return await this.datetaskSystemService.fetchBaseEnsureSystemTask(request, {
            handler: this.exchangeUtilsService.taskName,
            taskName: `汇率同步定时任务`,
            comment: '定时从Frankfurter获取汇率数据并更新数据库',
            cron: '30 8 * * *',
            // cron: '*/30 * * * * *',
            type: enums.CHUNK_DATETASK_TYPE.system.value
        })
    }
}
