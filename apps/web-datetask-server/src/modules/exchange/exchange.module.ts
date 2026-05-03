import { Module, OnModuleInit } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { ExchangeService } from '@web-datetask-server/modules/exchange/exchange.service'
import { DatetaskManagerModule } from '@web-datetask-server/modules/datetask/datetask.module'
import { DatetaskProcessor } from '@web-datetask-server/modules/datetask/datetask.processor'
import { DatetaskManagerService } from '@web-datetask-server/modules/datetask/datetask.service'

@Module({
    imports: [HttpModule, DatetaskManagerModule],
    providers: [ExchangeService]
})
export class ExchangeModule implements OnModuleInit {
    constructor(
        private readonly processor: DatetaskProcessor,
        private readonly exchangeService: ExchangeService,
        private readonly datetaskManager: DatetaskManagerService
    ) {}

    /**模块初始化时确保任务存在并注册汇率同步处理器**/
    async onModuleInit() {
        /**确保数据库中存在该任务定义**/
        await this.datetaskManager.ensureTask({
            name: 'exchange-sync',
            title: '同步汇率',
            description: '从外部接口获取最新汇率并同步到数据库',
            type: 'system',
            cron: '0 0 0 * * *', // 默认每1天执行一次
            handler: 'exchange-sync'
        })

        /**注册处理器**/
        this.processor.registerHandler('exchange-sync', () => this.exchangeService.syncExchangeRates())
    }
}
