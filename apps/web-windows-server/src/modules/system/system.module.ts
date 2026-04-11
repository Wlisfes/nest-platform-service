import { Module } from '@nestjs/common'
import { AccountService } from '@web-windows-server/modules/system/account/account.service'
import { AccountController } from '@web-windows-server/modules/system/account/account.controller'
import { SheetService } from '@web-windows-server/modules/system/sheet/sheet.service'
import { SheetController } from '@web-windows-server/modules/system/sheet/sheet.controller'
import { DeptService } from '@web-windows-server/modules/system/dept/dept.service'
import { DeptController } from '@web-windows-server/modules/system/dept/dept.controller'
import { RoleService } from '@web-windows-server/modules/system/role/role.service'
import { RoleController } from '@web-windows-server/modules/system/role/role.controller'
import { PositionService } from '@web-windows-server/modules/system/position/position.service'
import { PositionController } from '@web-windows-server/modules/system/position/position.controller'

@Module({
    providers: [AccountService, SheetService, DeptService, RoleService, PositionService],
    controllers: [AccountController, SheetController, DeptController, RoleController, PositionController],
    exports: [AccountService]
})
export class SystemModule {}
