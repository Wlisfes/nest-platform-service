import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger as WinstonLogger } from 'winston'
import { fetchLogger } from '@/utils/utils-common'
import { Omix, OmixHeaders } from '@/interface/instance.resolver'
export { WinstonLogger, WINSTON_MODULE_PROVIDER }

export class NestLogger {
    constructor(
        protected readonly logger: WinstonLogger,
        protected readonly loggerOption: {
            headers: OmixHeaders
            className: string
            propertyName: string
        }
    ) {}
    log(headers: OmixHeaders, args: Omix) {
        const { className, propertyName } = this.loggerOption
        this.logger.info([className, propertyName].join(':'), fetchLogger(headers, args))
    }
    info(args: Omix) {
        const { headers, className, propertyName } = this.loggerOption
        this.logger.info([className, propertyName].join(':'), fetchLogger(headers, args))
    }
    error(args: Omix) {
        const { headers, className, propertyName } = this.loggerOption
        this.logger.error(
            [className, propertyName].join(':'),
            fetchLogger(headers, {
                message: args.message,
                status: args.status ?? HttpStatus.INTERNAL_SERVER_ERROR
            })
        )
    }
}

export function Logger(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    descriptor.value = function (...args: any[]) {
        this.logger = new NestLogger(this.loggerService, {
            headers: args[0],
            className: this.constructor.name,
            propertyName: propertyName
        })
        try {
            const result = originalMethod.apply(this, args)
            if (result && typeof result.then === 'function' && typeof result.catch === 'function') {
                result.catch(err => {
                    this.logger.error({
                        message: err.message,
                        status: err.status ?? HttpStatus.INTERNAL_SERVER_ERROR
                    })
                })
            }
            return result
        } catch (err) {
            this.logger.error({
                message: err.message,
                status: err.status ?? HttpStatus.INTERNAL_SERVER_ERROR
            })
        }
    }
}

@Injectable()
export class LoggerService {
    protected readonly logger: NestLogger
    @Inject(WINSTON_MODULE_PROVIDER) protected readonly loggerService: WinstonLogger

    public async fetchWhereException(where: boolean, handler: Function) {
        if (where) {
            return await handler()
        }
        return where
    }

    public async fetchThrowException(message: any, code: number) {
        throw new HttpException(message, code ?? HttpStatus.INTERNAL_SERVER_ERROR)
    }
}
