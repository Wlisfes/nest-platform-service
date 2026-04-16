import { Module } from '@nestjs/common'
import { BrandService } from '@web-windows-server/modules/finance/brand/brand.service'
import { BrandController } from '@web-windows-server/modules/finance/brand/brand.controller'
import { CurrencyService } from '@web-windows-server/modules/finance/currency/currency.service'
import { CurrencyController } from '@web-windows-server/modules/finance/currency/currency.controller'
import { ClientService } from '@web-windows-server/modules/finance/client/client.service'
import { ClientController } from '@web-windows-server/modules/finance/client/client.controller'

@Module({
    providers: [BrandService, CurrencyService, ClientService],
    controllers: [BrandController, CurrencyController, ClientController],
    exports: [BrandService, CurrencyService, ClientService]
})
export class FinanceModule {}
