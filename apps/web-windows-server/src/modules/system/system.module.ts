import { Module } from '@nestjs/common'
import { AccountService } from '@web-windows-server/modules/system/account/account.service'
import { AccountController } from '@web-windows-server/modules/system/account/account.controller'
import { SheetService } from '@web-windows-server/modules/system/sheet/sheet.service'
import { SheetController } from '@web-windows-server/modules/system/sheet/sheet.controller'
import { DeptService } from '@web-windows-server/modules/system/dept/dept.service'
import { DeptController } from '@web-windows-server/modules/system/dept/dept.controller'
import { RoleService } from '@web-windows-server/modules/system/role/role.service'
import { RoleController } from '@web-windows-server/modules/system/role/role.controller'

@Module({
    providers: [AccountService, SheetService, DeptService, RoleService],
    controllers: [AccountController, SheetController, DeptController, RoleController],
    exports: [AccountService]
})
export class SystemModule {}
