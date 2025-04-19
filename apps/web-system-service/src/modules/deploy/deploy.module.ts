import { Module } from '@nestjs/common'
import { DeployChunkService } from '@web-system-service/modules/deploy/deploy-chunk.service'
import { DeployCodexService } from '@web-system-service/modules/deploy/deploy-codex.service'
import { DeployCodexController } from '@web-system-service/modules/deploy/deploy-codex.controller'

@Module({
    imports: [],
    providers: [DeployChunkService, DeployCodexService],
    controllers: [DeployCodexController],
    exports: [DeployChunkService, DeployCodexService]
})
export class DeployModule {}
