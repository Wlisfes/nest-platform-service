import { Module } from '@nestjs/common'
import { DeployChunkService } from '@web-system-service/modules/deploy/deploy-chunk.service'
import { DeployFieldService } from '@web-system-service/modules/deploy/deploy-field.service'
import { DeployCodexService } from '@web-system-service/modules/deploy/deploy-codex.service'
import { DeployCodexController } from '@web-system-service/modules/deploy/deploy-codex.controller'

@Module({
    imports: [],
    providers: [DeployChunkService, DeployFieldService, DeployCodexService],
    controllers: [DeployCodexController],
    exports: [DeployChunkService, DeployFieldService, DeployCodexService]
})
export class DeployModule {}
