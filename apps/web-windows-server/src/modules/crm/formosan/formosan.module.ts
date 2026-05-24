import { Module } from '@nestjs/common'
import { SmsFormosanService } from '@web-windows-server/modules/crm/formosan/sms/sms-formosan.service'
import { SmsFormosanUtilsService } from '@web-windows-server/modules/crm/formosan/sms/sms-formosan.utils.service'
import { SmsFormosanController } from '@web-windows-server/modules/crm/formosan/sms/sms-formosan.controller'

@Module({
    providers: [SmsFormosanUtilsService, SmsFormosanService],
    controllers: [SmsFormosanController],
    exports: [SmsFormosanUtilsService, SmsFormosanService]
})
export class CrmFormosanModule {}
