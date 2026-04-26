import { Module, Global } from '@nestjs/common'
import { DeployDeptService } from '@web-windows-server/modules/deploy/dept/dept.service'
import { DeployDeptUtilsService } from '@web-windows-server/modules/deploy/dept/dept.utils.service'
import { DeployDeptScopeService } from '@web-windows-server/modules/deploy/dept/dept.scope.service'
import { DeployDeptController } from '@web-windows-server/modules/deploy/dept/dept.controller'

@Global()
@Module({
    providers: [DeployDeptUtilsService, DeployDeptScopeService, DeployDeptService],
    controllers: [DeployDeptController],
    exports: [DeployDeptUtilsService, DeployDeptScopeService, DeployDeptService]
})
export class DeployDeptModule {}
