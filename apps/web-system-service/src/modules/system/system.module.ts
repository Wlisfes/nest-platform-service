import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { SystemDictController } from '@web-system-service/modules/system/system-dict.controller'
import { SystemDictService } from '@web-system-service/modules/system/system-dict.service'
import { SystemUserController } from '@web-system-service/modules/system/system-user.controller'
import { SystemUserService } from '@web-system-service/modules/system/system-user.service'
import { SystemRouterController } from '@web-system-service/modules/system/system-router.controller'
import { SystemRouterService } from '@web-system-service/modules/system/system-router.service'
import { SystemRoleController } from '@web-system-service/modules/system/system-role.controller'
import { SystemRoleService } from '@web-system-service/modules/system/system-role.service'

@Module({
    imports: [HttpModule],
    controllers: [SystemDictController, SystemUserController, SystemRouterController, SystemRoleController],
    providers: [SystemDictService, SystemUserService, SystemRouterService, SystemRoleService],
    exports: [SystemDictService, SystemUserService, SystemRouterService, SystemRoleService]
})
export class SystemModule {}
