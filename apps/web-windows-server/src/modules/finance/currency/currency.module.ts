import { Module, Global } from '@nestjs/common'
import { FinanceCurrencyService } from '@web-windows-server/modules/finance/currency/currency.service'
import { FinanceCurrencyUtilsService } from '@web-windows-server/modules/finance/currency/currency.utils.service'
import { FinanceCurrencyController } from '@web-windows-server/modules/finance/currency/currency.controller'

@Global()
@Module({
    providers: [FinanceCurrencyUtilsService, FinanceCurrencyService],
    controllers: [FinanceCurrencyController],
    exports: [FinanceCurrencyUtilsService, FinanceCurrencyService]
})
export class FinanceCurrencyModule {}

