import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { DeployChunkService } from '@web-system-service/modules/deploy/deploy-chunk.service'
import { DeployCodexService } from '@web-system-service/modules/deploy/deploy-codex.service'
import { SystemChunkController } from '@web-system-service/modules/system/system-chunk.controller'
import { SystemChunkService } from '@web-system-service/modules/system/system-chunk.service'
import { SystemUserController } from '@web-system-service/modules/system/system-user.controller'
import { SystemUserService } from '@web-system-service/modules/system/system-user.service'
import { SystemRouterController } from '@web-system-service/modules/system/system-router.controller'
import { SystemRouterService } from '@web-system-service/modules/system/system-router.service'
import { SystemRoleController } from '@web-system-service/modules/system/system-role.controller'
import { SystemRoleService } from '@web-system-service/modules/system/system-role.service'

@Module({
    imports: [HttpModule],
    controllers: [SystemChunkController, SystemUserController, SystemRouterController, SystemRoleController],
    providers: [DeployChunkService, DeployCodexService, SystemChunkService, SystemUserService, SystemRouterService, SystemRoleService],
    exports: [SystemChunkService, SystemUserService, SystemRouterService, SystemRoleService]
})
export class SystemModule {}
