import { Module } from '@nestjs/common'
import { DeployChunkService } from '@web-system-service/modules/deploy/deploy-chunk.service'
import { DeployKinesService } from '@web-system-service/modules/deploy/deploy-kines.service'
import { DeployCodexService } from '@web-system-service/modules/deploy/deploy-codex.service'
import { DeployCodexController } from '@web-system-service/modules/deploy/deploy-codex.controller'

@Module({
    imports: [],
    providers: [DeployChunkService, DeployKinesService, DeployCodexService],
    controllers: [DeployCodexController],
    exports: [DeployChunkService, DeployKinesService, DeployCodexService]
})
export class DeployModule {}
