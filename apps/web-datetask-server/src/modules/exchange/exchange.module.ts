import { Module, Global } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { ExchangeService } from '@web-datetask-server/modules/exchange/exchange.service'
import { ExchangeUtilsService } from '@web-datetask-server/modules/exchange/exchange.utils.service'

@Global()
@Module({
    imports: [HttpModule],
    providers: [ExchangeService, ExchangeUtilsService],
    exports: [ExchangeService, ExchangeUtilsService]
})
export class ExchangeModule {}
