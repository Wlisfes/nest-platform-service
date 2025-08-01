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
        this.deplayName = [className, methodName].join(':')
        this.logger = new WinstonService(this.logger, args[0], {
            date: args[0]?.headers?.datetime,
            deplayName: this.deplayName
        })
        return originalMethod.apply(this, args)
    }
}

/**封装日志输出包**/
export class WinstonService {
    private logger: WinstonLogger
    private request: OmixRequest
    private options: Omix
    private date: Date
    constructor(logger: WinstonLogger, request: OmixRequest, options: Omix) {
        this.logger = logger
        this.request = request
        this.options = options
        this.date = new Date(options.date ? Number(options.date) : undefined)
    }
    /**日志组合输出**/
    private output(log: Omix) {
        return { duration: `${Date.now() - this.date.getTime()}ms`, context: this.request.headers.context, log: log }
    }
    /**时间重置**/
    public reset() {
        this.date = new Date()
        return this
    }
    public info(log: Omix) {
        this.logger.info(this.options.deplayName, this.output(log))
        return this
    }
    public error(log: Omix) {
        this.logger.error(this.options.deplayName, this.output(log))
        return this
    }
}

@Injectable()
export class Logger {
    public readonly deplayName: string
    @Inject(WINSTON_MODULE_PROVIDER) protected readonly logger: WinstonLogger

    /**创建日志实例方法**/
    public async fetchServiceTransaction(request: OmixRequest, opts: Omix<{ deplayName: string }>) {
        return new WinstonService(this.logger, request, opts)
    }

    /**日志方法名称组合**/
    public fetchDeplayName(alias?: string) {
        const suffix = this.deplayName.split(':').pop()
        return alias ? `${alias}:${suffix}` : this.deplayName
    }

    /**返回包装**/
    public async fetchResolver<T>(data: Partial<OmixResult<T>>) {
        return data
    }
}
