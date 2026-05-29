import { Module, Global } from '@nestjs/common'
import { DeployDatetaskService } from '@web-windows-server/modules/deploy/datetask/datetask.service'
import { DeployDatetaskController } from '@web-windows-server/modules/deploy/datetask/datetask.controller'

@Global()
@Module({
    providers: [DeployDatetaskService],
    controllers: [DeployDatetaskController]
})
export class DeployDatetaskModule {}
