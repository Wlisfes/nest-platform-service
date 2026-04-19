import { Module } from '@nestjs/common'
import { AccountUtilsService } from '@web-windows-server/modules/system/account/account.utils.service'
import { CrmClientService } from '@web-windows-server/modules/crm/client/client.service'
import { CrmClientController } from '@web-windows-server/modules/crm/client/client.controller'

@Module({
    providers: [AccountUtilsService, CrmClientService],
    controllers: [CrmClientController],
    exports: []
})
export class CrmModule {}
