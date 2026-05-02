import { Module, Global } from '@nestjs/common'
import { FinanceCountryController } from '@web-windows-server/modules/finance/country/country.controller'
import { FinanceCountryService } from '@web-windows-server/modules/finance/country/country.service'
import { FinanceCountryUtilsService } from '@web-windows-server/modules/finance/country/country.utils.service'

@Global()
@Module({
    providers: [FinanceCountryService, FinanceCountryUtilsService],
    controllers: [FinanceCountryController],
    exports: [FinanceCountryService, FinanceCountryUtilsService]
})
export class FinanceCountryModule {}
