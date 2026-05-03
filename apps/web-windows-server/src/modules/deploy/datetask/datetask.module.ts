import { Module, Global } from '@nestjs/common'
import { BullModule } from '@nestjs/bullmq'
import { DeployDatetaskService } from '@web-windows-server/modules/deploy/datetask/datetask.service'
import { DeployDatetaskController } from '@web-windows-server/modules/deploy/datetask/datetask.controller'

@Global()
@Module({
    imports: [
        BullModule.registerQueue({
            name: 'datetask-queue'
        })
    ],
    providers: [DeployDatetaskService],
    controllers: [DeployDatetaskController],
    exports: []
})
export class DeployDatetaskModule {}
