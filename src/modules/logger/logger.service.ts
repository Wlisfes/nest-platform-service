import { Injectable, Inject } from '@nestjs/common'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger as WinstonLogger } from 'winston'
import { OmixRequest } from '@/interface'

/**注入日志配置**/
export function AutoDescriptor(target: any, propertyName: string, descriptor: Omix<PropertyDescriptor>) {
    const className = target.constructor.name
    const methodName = propertyName
    const originalMethod = descriptor.value
    descriptor.value = function (...args: any[]) {
        const request = args[0] ?? {}
        this.stack = [className, methodName].join(':')
        this.logger = new WinstonService(this.winston, request, {
            datetime: request.headers?.datetime,
            stack: this.stack
        })
        return originalMethod.apply(this, args)
    }
}

/**封装日志输出包**/
export class WinstonService {
    private logger: WinstonLogger
    private request: OmixRequest
    private options: Omix
    private date: Date = new Date()
    constructor(logger: WinstonLogger, request: OmixRequest, options: Omix) {
        this.logger = logger
        this.request = request
        this.options = options
        if (options.datetime) {
            this.date = new Date(Number(options.datetime))
        }
    }
    /**日志组合输出**/
    private output(log: any) {
        return { duration: `${Date.now() - this.date.getTime()}ms`, logId: this.request.headers.logId, log: log }
    }
    /**时间重置**/
    public reset() {
        this.date = new Date()
        return this
    }
    public info(log: any) {
        this.logger.info(this.options.stack, this.output(log))
        return this
    }
    public error(log: any) {
        this.logger.error(this.options.stack, this.output(log))
        return this
    }
}

@Injectable()
export class Logger {
    protected readonly stack: string
    protected readonly logger: WinstonService
    @Inject(WINSTON_MODULE_PROVIDER) protected readonly winston: WinstonLogger

    /**创建日志实例方法**/
    public async fetchServiceTransaction(request: OmixRequest, opts: Omix<{ stack: string }>) {
        return new WinstonService(this.winston, request, opts)
    }

    /**日志方法名称组合**/
    public fetchDeplayName(alias?: string) {
        const suffix = this.stack.split(':').pop()
        return alias ? `${alias}:${suffix}` : this.stack
    }

    /**返回包装**/
    public async fetchResolver<T>(data: Partial<OmixResult<T>>) {
        return data
    }
}
