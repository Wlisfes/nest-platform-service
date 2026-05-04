import { Injectable } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { ExchangeService } from '@web-datetask-server/modules/exchange/exchange.service'
import { DatetaskService } from '@web-datetask-server/modules/datetask/datetask.service'
import { OmixRequest } from '@/interface'

@Injectable()
export class AppService extends Logger {
    constructor(private readonly exchangeService: ExchangeService, private readonly datetaskService: DatetaskService) {
        super()
    }

    /**任务初始化**/
    @AutoDescriptor
    public async fetchDatetaskInitialization(request?: OmixRequest) {
        const tasks = [
            /**初始化费率定时任务**/
            this.exchangeService.fetchInitEventRegister(request)
        ]
        return await Promise.all(tasks).then(async () => {
            return await this.datetaskService.fetchTasksRegister(request)
        })
    }
}
