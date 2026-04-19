import { Module, Global } from '@nestjs/common'
import { DeploySheetService } from '@web-windows-server/modules/deploy/sheet/sheet.service'
import { DeploySheetController } from '@web-windows-server/modules/deploy/sheet/sheet.controller'

@Global()
@Module({
    providers: [DeploySheetService],
    controllers: [DeploySheetController],
    exports: []
})
export class DeploySheetModule {}
