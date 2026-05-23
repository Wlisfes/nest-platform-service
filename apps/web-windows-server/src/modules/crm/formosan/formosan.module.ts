import { Module } from '@nestjs/common'
import { SmsFormosanService } from '@web-windows-server/modules/crm/formosan/sms/sms-formosan.service'
import { SmsFormosanController } from '@web-windows-server/modules/crm/formosan/sms/sms-formosan.controller'

@Module({
    providers: [SmsFormosanService],
    controllers: [SmsFormosanController],
    exports: [SmsFormosanService]
})
export class CrmFormosanModule {}
