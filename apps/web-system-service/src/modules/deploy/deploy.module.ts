import { Module } from '@nestjs/common'
import { DeployCodexService } from '@web-system-service/modules/deploy/deploy-codex.service'
import { DeployCodexController } from '@web-system-service/modules/deploy/deploy-codex.controller'

@Module({
    imports: [],
    providers: [DeployCodexService],
    controllers: [DeployCodexController],
    exports: [DeployCodexService]
})
export class DeployModule {}
