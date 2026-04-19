import { Module } from '@nestjs/common'

import { SheetService } from '@web-windows-server/modules/system/sheet/sheet.service'
import { SheetController } from '@web-windows-server/modules/system/sheet/sheet.controller'
import { RoleService } from '@web-windows-server/modules/system/role/role.service'
import { RoleController } from '@web-windows-server/modules/system/role/role.controller'
import { PositionService } from '@web-windows-server/modules/system/position/position.service'
import { PositionController } from '@web-windows-server/modules/system/position/position.controller'
import { DeployDeptModule } from '@web-windows-server/modules/system/dept/dept.module'
import { DeployAccoutModule } from '@web-windows-server/modules/system/account/accout.module'

@Module({
    imports: [DeployDeptModule, DeployAccoutModule],
    providers: [SheetService, RoleService, PositionService],
    controllers: [SheetController, RoleController, PositionController],
    exports: []
})
export class SystemModule {}
