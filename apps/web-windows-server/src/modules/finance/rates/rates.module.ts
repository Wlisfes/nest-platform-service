import { Module } from '@nestjs/common'
import { FinanceSmsRateController } from '@web-windows-server/modules/finance/rates/sms/sms-rate.controller'
import { FinanceSmsRateService } from '@web-windows-server/modules/finance/rates/sms/sms-rate.service'

@Module({
    controllers: [FinanceSmsRateController],
    providers: [FinanceSmsRateService]
})
export class FinanceRatesModule {}
