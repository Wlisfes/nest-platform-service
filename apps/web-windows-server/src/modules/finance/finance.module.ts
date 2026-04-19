import { Module } from '@nestjs/common'
import { FinanceBrandService } from '@web-windows-server/modules/finance/brand/brand.service'
import { FinanceBrandController } from '@web-windows-server/modules/finance/brand/brand.controller'
import { FinanceCurrencyService } from '@web-windows-server/modules/finance/currency/currency.service'
import { FinanceCurrencyController } from '@web-windows-server/modules/finance/currency/currency.controller'
import { FinanceClientService } from '@web-windows-server/modules/finance/client/client.service'
import { FinanceClientController } from '@web-windows-server/modules/finance/client/client.controller'

@Module({
    providers: [FinanceBrandService, FinanceCurrencyService, FinanceClientService],
    controllers: [FinanceBrandController, FinanceCurrencyController, FinanceClientController],
    exports: [FinanceBrandService, FinanceCurrencyService, FinanceClientService]
})
export class FinanceModule {}
