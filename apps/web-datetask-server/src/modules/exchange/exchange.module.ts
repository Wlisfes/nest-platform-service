import { Module, OnModuleInit } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { ExchangeService } from '@web-datetask-server/modules/exchange/exchange.service'

@Module({
    imports: [HttpModule],
    providers: [ExchangeService]
})
export class ExchangeModule implements OnModuleInit {
    constructor(private readonly exchangeService: ExchangeService) {}

    /**模块初始化时确保任务存在并注册汇率同步处理器**/
    async onModuleInit() {
        return this.exchangeService.fetchInitEventRegister()
    }
}
