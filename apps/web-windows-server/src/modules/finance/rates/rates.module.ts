import { Module } from '@nestjs/common'
import { FinanceSmsRateController } from '@web-windows-server/modules/finance/rates/sms/sms-rate.controller'
import { FinanceSmsRateService } from '@web-windows-server/modules/finance/rates/sms/sms-rate.service'
import { FinanceSmsRateUtilsService } from '@web-windows-server/modules/finance/rates/sms/sms-rate.utils.service'

@Module({
    controllers: [FinanceSmsRateController],
    providers: [FinanceSmsRateUtilsService, FinanceSmsRateService],
    exports: [FinanceSmsRateUtilsService, FinanceSmsRateService]
})
export class FinanceRatesModule {}
