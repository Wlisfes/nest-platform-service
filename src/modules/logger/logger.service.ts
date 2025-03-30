import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger as WinstonLogger } from 'winston'
import { Omix } from '@/interface/instance.resolver'

/**注入日志配置**/
export function AutoMethodDescriptor(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const className = target.constructor.name
    const methodName = propertyName
    const originalMethod = descriptor.value
    descriptor.value = function (...args: any[]) {
        this.deplayName = [className, methodName].join(':')
        return originalMethod.apply(this, args)
    }
}

@Injectable()
export class Logger {
    public readonly deplayName: string
    @Inject(WINSTON_MODULE_PROVIDER) protected readonly logger: WinstonLogger

    /**返回包装**/
    public async fetchResolver<T = Partial<Omix<{ message: string; list: Array<Omix>; total: number; page: number; size: number }>>>(
        data: T
    ) {
        return data
    }

    /**异常抛出**/
    public async fetchCatchCompiler(name: string, err: any) {
        this.logger.error(name, { log: err })
        throw new HttpException(err.message ?? err.response, err.status ?? HttpStatus.INTERNAL_SERVER_ERROR, err.options)
    }
}
