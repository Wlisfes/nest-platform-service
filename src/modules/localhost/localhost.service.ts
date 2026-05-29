import { Injectable, Inject } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { Logger } from '@/modules/logger/logger.service'

@Injectable()
export class LocalhostService extends Logger {
    constructor(@Inject('web-datetask-server') public readonly datetaskServer: ClientProxy) {
        super()
    }
}
