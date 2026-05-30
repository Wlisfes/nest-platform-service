import { Module } from '@nestjs/common'
import { SmsSaturationService } from '@web-windows-server/modules/crm/saturation/sms/sms-saturation.service'
import { SmsSaturationController } from '@web-windows-server/modules/crm/saturation/sms/sms-saturation.controller'

@Module({
    providers: [SmsSaturationService],
    controllers: [SmsSaturationController],
    exports: [SmsSaturationService]
})
export class CrmSaturationModule {}
