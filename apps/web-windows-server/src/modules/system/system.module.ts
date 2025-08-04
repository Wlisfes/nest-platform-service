import { Module } from '@nestjs/common'
import { AccountService } from '@web-windows-server/modules/system/account/account.service'
import { AccountController } from '@web-windows-server/modules/system/account/account.controller'
import { ResourceService } from '@web-windows-server/modules/system/resource/resource.service'
import { ResourceController } from '@web-windows-server/modules/system/resource/resource.controller'
import { DeptService } from '@web-windows-server/modules/system/dept/dept.service'
import { DeptController } from '@web-windows-server/modules/system/dept/dept.controller'
import { RoleService } from '@web-windows-server/modules/system/role/role.service'
import { RoleController } from '@web-windows-server/modules/system/role/role.controller'

@Module({
    providers: [AccountService, ResourceService, DeptService, RoleService],
    controllers: [AccountController, ResourceController, DeptController, RoleController],
    exports: [AccountService]
})
export class SystemModule {}
