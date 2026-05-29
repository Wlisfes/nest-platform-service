import { Module, Global } from '@nestjs/common'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { LocalhostService } from '@/modules/localhost/localhost.service'

@Global()
@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'web-datetask-server',
                transport: Transport.TCP,
                options: { host: 'localhost', port: process.env.NODE_WEB_DATETASK_TCP_PORT }
            }
        ])
    ],
    providers: [LocalhostService],
    exports: [LocalhostService]
})
export class LocalhostModule {}
