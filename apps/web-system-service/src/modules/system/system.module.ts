import { Module } from '@nestjs/common'
import { SystemUserController } from '@web-system-service/modules/system/system-user.controller'
import { SystemUserService } from '@web-system-service/modules/system/system-user.service'
import { SystemRouterController } from '@web-system-service/modules/system/system-router.controller'
import { SystemRouterService } from '@web-system-service/modules/system/system-router.service'
import { SystemRoleController } from '@web-system-service/modules/system/system-role.controller'
import { SystemRoleService } from '@web-system-service/modules/system/system-role.service'

@Module({
    controllers: [SystemUserController, SystemRouterController, SystemRoleController],
    providers: [SystemUserService, SystemRouterService, SystemRoleService],
    exports: [SystemUserService, SystemRouterService, SystemRoleService]
})
export class SystemModule {}
