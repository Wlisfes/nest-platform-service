import { Module, Global } from '@nestjs/common'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { BullModule } from '@nestjs/bullmq'
import { DeployDatetaskService } from '@web-windows-server/modules/deploy/datetask/datetask.service'
import { DeployDatetaskController } from '@web-windows-server/modules/deploy/datetask/datetask.controller'

@Global()
@Module({
    imports: [
        BullModule.registerQueue({ name: 'datetask-queue' }),
        ClientsModule.register([
            {
                name: 'web-datetask-server',
                transport: Transport.TCP,
                options: {
                    host: 'localhost',
                    port: process.env.NODE_WEB_DATETASK_PORT
                }
            }
        ])
    ],
    providers: [DeployDatetaskService],
    controllers: [DeployDatetaskController],
    exports: []
})
export class DeployDatetaskModule {}
