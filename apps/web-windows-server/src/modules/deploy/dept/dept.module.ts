import { Module, Global } from '@nestjs/common'
import { DeployDeptService } from '@web-windows-server/modules/deploy/dept/dept.service'
import { DeployDeptUtilsService } from '@web-windows-server/modules/deploy/dept/dept.utils.service'
import { DeployDeptController } from '@web-windows-server/modules/deploy/dept/dept.controller'

@Global()
@Module({
    providers: [DeployDeptUtilsService, DeployDeptService],
    controllers: [DeployDeptController],
    exports: [DeployDeptUtilsService, DeployDeptService]
})
export class DeployDeptModule {}
