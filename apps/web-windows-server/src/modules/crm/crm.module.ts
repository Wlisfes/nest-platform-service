import { Module } from '@nestjs/common'
import { CrmClientModule } from '@web-windows-server/modules/crm/client/client.module'
import { CrmFormosanModule } from '@web-windows-server/modules/crm/formosan/formosan.module'
import { CrmSaturationModule } from '@web-windows-server/modules/crm/saturation/saturation.module'

@Module({
    imports: [CrmClientModule, CrmFormosanModule, CrmSaturationModule],
    providers: [],
    controllers: [],
    exports: []
})
export class CrmModule {}
