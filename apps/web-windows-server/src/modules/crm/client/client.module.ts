import { Module } from '@nestjs/common'
import { CrmClientService } from '@web-windows-server/modules/crm/client/client.service'
import { CrmClientSmsService } from '@web-windows-server/modules/crm/client/client.sms.service'
import { CrmClientUtilsService } from '@web-windows-server/modules/crm/client/client.utils.service'
import { CrmClientController } from '@web-windows-server/modules/crm/client/client.controller'

@Module({
    providers: [CrmClientService, CrmClientSmsService, CrmClientUtilsService],
    controllers: [CrmClientController],
    exports: [CrmClientService, CrmClientSmsService, CrmClientUtilsService]
})
export class CrmClientModule {}
