import { Module, Global } from '@nestjs/common'
import { FinanceCountryService } from '@web-windows-server/modules/finance/country/country.service'
import { FinanceCountryController } from '@web-windows-server/modules/finance/country/country.controller'

@Global()
@Module({
    providers: [FinanceCountryService],
    controllers: [FinanceCountryController],
    exports: [FinanceCountryService]
})
export class FinanceCountryModule {}
