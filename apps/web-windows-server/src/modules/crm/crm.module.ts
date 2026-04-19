import { Module } from '@nestjs/common'
import { CrmClientService } from '@web-windows-server/modules/crm/client/client.service'
import { CrmClientController } from '@web-windows-server/modules/crm/client/client.controller'

@Module({
    providers: [CrmClientService],
    controllers: [CrmClientController],
    exports: []
})
export class CrmModule {}
