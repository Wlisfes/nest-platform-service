import { Module, Global } from '@nestjs/common'
import { FinanceCurrencyService } from '@web-windows-server/modules/finance/currency/currency.service'
import { FinanceCurrencyController } from '@web-windows-server/modules/finance/currency/currency.controller'

@Global()
@Module({
    providers: [FinanceCurrencyService],
    controllers: [FinanceCurrencyController],
    exports: [FinanceCurrencyService]
})
export class FinanceCurrencyModule {}
