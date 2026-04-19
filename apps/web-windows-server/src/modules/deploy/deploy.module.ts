import { Module } from '@nestjs/common'
import { DeployDeptModule } from '@web-windows-server/modules/deploy/dept/dept.module'
import { DeploySheetModule } from '@web-windows-server/modules/deploy/sheet/sheet.module'
import { DeployRoleModule } from '@web-windows-server/modules/deploy/role/role.module'
import { DeployPositionModule } from '@web-windows-server/modules/deploy/position/position.module'
import { DeployAccoutModule } from '@web-windows-server/modules/deploy/account/accout.module'

@Module({
    imports: [DeployDeptModule, DeploySheetModule, DeployRoleModule, DeployPositionModule, DeployAccoutModule]
})
export class DeployModule {}
