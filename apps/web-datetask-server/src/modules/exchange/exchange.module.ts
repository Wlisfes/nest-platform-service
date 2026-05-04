import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { ExchangeService } from '@web-datetask-server/modules/exchange/exchange.service'

@Module({
    imports: [HttpModule],
    providers: [ExchangeService],
    exports: [ExchangeService]
})
export class ExchangeModule {}
