import { Injectable } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { DataBaseService, WindowsService } from '@/modules/database/database.service'
import { ExchangeService } from '@web-datetask-server/modules/exchange/exchange.service'
import { OmixRequest } from '@/interface'

@Injectable()
export class AppService extends Logger {
    constructor(
        private readonly database: DataBaseService,
        private readonly windows: WindowsService,
        private readonly exchangeService: ExchangeService
    ) {
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
            console.log('任务初始化成功')
        })
    }
}
