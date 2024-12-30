import { Injectable, Inject } from '@nestjs/common'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger as WinstonLogger } from 'winston'

@Injectable()
export class Logger {
    @Inject(WINSTON_MODULE_PROVIDER) protected readonly logger: WinstonLogger
}
