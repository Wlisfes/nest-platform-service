import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger as WinstonLogger } from 'winston'

@Injectable()
export class Logger {
    @Inject(WINSTON_MODULE_PROVIDER) protected readonly logger: WinstonLogger

    /**异常抛出**/
    public async fetchCatchCompiler(name: string, err: any) {
        this.logger.error(name, { log: err })
        throw new HttpException(err.response, err.status ?? HttpStatus.INTERNAL_SERVER_ERROR, err.options)
    }
}
