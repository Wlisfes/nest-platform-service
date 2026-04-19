import { Module } from '@nestjs/common'
import { CrmClientModule } from '@web-windows-server/modules/crm/client/client.module'

@Module({
    imports: [CrmClientModule],
    providers: [],
    controllers: [],
    exports: []
})
export class CrmModule {}
