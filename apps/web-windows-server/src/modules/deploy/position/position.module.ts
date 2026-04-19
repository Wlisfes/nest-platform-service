import { Module, Global } from '@nestjs/common'
import { DeployPositionService } from '@web-windows-server/modules/deploy/position/position.service'
import { DeployPositionController } from '@web-windows-server/modules/deploy/position/position.controller'

@Global()
@Module({
    providers: [DeployPositionService],
    controllers: [DeployPositionController],
    exports: []
})
export class DeployPositionModule {}
