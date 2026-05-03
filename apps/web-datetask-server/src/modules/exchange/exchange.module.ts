import { Module, OnModuleInit } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { ExchangeService } from '@web-datetask-server/modules/exchange/exchange.service'
import { DatetaskManagerModule } from '@web-datetask-server/modules/datetask/datetask.module'
import { DatetaskProcessor } from '@web-datetask-server/modules/datetask/datetask.processor'

@Module({
    imports: [HttpModule, DatetaskManagerModule],
    providers: [ExchangeService]
})
export class ExchangeModule implements OnModuleInit {
    constructor(
        private readonly processor: DatetaskProcessor,
        private readonly exchangeService: ExchangeService
    ) {}

    /**模块初始化时注册汇率同步处理器**/
    onModuleInit() {
        this.processor.registerHandler('exchange-sync', () => this.exchangeService.syncExchangeRates())
    }
}
