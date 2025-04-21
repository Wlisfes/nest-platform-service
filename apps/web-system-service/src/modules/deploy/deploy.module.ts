import { Module } from '@nestjs/common'
import { DeployEnumsService } from '@web-system-service/modules/deploy/deploy-enums.service'
import { DeployKinesService } from '@web-system-service/modules/deploy/deploy-kines.service'
import { DeployCodexService } from '@web-system-service/modules/deploy/deploy-codex.service'
import { DeployController } from '@web-system-service/modules/deploy/deploy.controller'

@Module({
    imports: [],
    providers: [DeployEnumsService, DeployKinesService, DeployCodexService],
    controllers: [DeployController],
    exports: [DeployEnumsService, DeployKinesService, DeployCodexService]
})
export class DeployModule {}
