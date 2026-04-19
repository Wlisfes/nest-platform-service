import { Module } from '@nestjs/common'
import { FinanceBrandModule } from '@web-windows-server/modules/finance/brand/brand.module'
import { FinanceClientModule } from '@web-windows-server/modules/finance/client/client.module'
import { FinanceCurrencyModule } from '@web-windows-server/modules/finance/currency/currency.module'

@Module({
    imports: [FinanceBrandModule, FinanceClientModule, FinanceCurrencyModule]
})
export class FinanceModule {}
