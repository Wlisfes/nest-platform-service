import { Module } from '@nestjs/common'
import { CrmClientService } from '@web-windows-server/modules/crm/client/client.service'
import { CrmClientUtilsService } from '@web-windows-server/modules/crm/client/client.utils.service'
import { CrmClientController } from '@web-windows-server/modules/crm/client/client.controller'

@Module({
    providers: [CrmClientService, CrmClientUtilsService],
    controllers: [CrmClientController],
    exports: [CrmClientService, CrmClientUtilsService]
})
export class CrmClientModule {}
