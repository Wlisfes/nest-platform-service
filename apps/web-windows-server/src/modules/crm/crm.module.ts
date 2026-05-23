import { Module } from '@nestjs/common'
import { CrmClientModule } from '@web-windows-server/modules/crm/client/client.module'
import { CrmFormosanModule } from '@web-windows-server/modules/crm/formosan/formosan.module'

@Module({
    imports: [CrmClientModule, CrmFormosanModule],
    providers: [],
    controllers: [],
    exports: []
})
export class CrmModule {}
