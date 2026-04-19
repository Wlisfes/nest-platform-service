import { Module, Global } from '@nestjs/common'
import { DeployDeptService } from '@web-windows-server/modules/system/dept/dept.service'
import { DeployDeptUtilsService } from '@web-windows-server/modules/system/dept/dept.utils.service'
import { DeployDeptController } from '@web-windows-server/modules/system/dept/dept.controller'

@Global()
@Module({
    providers: [DeployDeptUtilsService, DeployDeptService],
    controllers: [DeployDeptController],
    exports: [DeployDeptUtilsService, DeployDeptService]
})
export class DeployDeptModule {}
