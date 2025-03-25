import { Module } from '@nestjs/common'
import { SystemRouterController } from '@web-system-service/modules/system/system-router.controller'
import { SystemRouterService } from '@web-system-service/modules/system/system-router.service'
import { SystemRoleController } from '@web-system-service/modules/system/system-role.controller'
import { SystemRoleService } from '@web-system-service/modules/system/system-role.service'

@Module({
    controllers: [SystemRouterController, SystemRoleController],
    providers: [SystemRouterService, SystemRoleService],
    exports: [SystemRouterService, SystemRoleService]
})
export class SystemModule {}
