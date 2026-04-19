import { Module, Global } from '@nestjs/common'
import { DeployRoleService } from '@web-windows-server/modules/deploy/role/role.service'
import { DeployRoleController } from '@web-windows-server/modules/deploy/role/role.controller'

@Global()
@Module({
    providers: [DeployRoleService],
    controllers: [DeployRoleController],
    exports: []
})
export class DeployRoleModule {}
