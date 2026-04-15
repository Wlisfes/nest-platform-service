import { Module } from '@nestjs/common'
import { BrandService } from '@web-windows-server/modules/finance/brand/brand.service'
import { BrandController } from '@web-windows-server/modules/finance/brand/brand.controller'
import { CurrencyService } from '@web-windows-server/modules/finance/currency/currency.service'
import { CurrencyController } from '@web-windows-server/modules/finance/currency/currency.controller'

@Module({
    providers: [BrandService, CurrencyService],
    controllers: [BrandController, CurrencyController],
    exports: [BrandService, CurrencyService]
})
export class FinanceModule {}
