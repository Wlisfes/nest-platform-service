import { ApiOperationOptions, ApiResponseOptions } from '@nestjs/swagger'
import { ApiOperation, ApiConsumes, ApiProduces, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { applyDecorators, Type } from '@nestjs/common'
import { Throttle, SkipThrottle } from '@nestjs/throttler'
import { isEmpty, isNotEmpty } from 'class-validator'
import { AuthClientOptions, AuthWindowsOptions, ThrottlerOptions, ApiClientGuardReflector, ApiWindowsGuardReflector } from '@/guard'

export interface ApiDecoratorOptions {
    /**接口描述**/
    operation: ApiOperationOptions
    /**接口响应描述**/
    response: ApiResponseOptions
    /**客户端登录校验**/
    clinet?: boolean | AuthClientOptions
    /**管理登录校验**/
    windows?: boolean | AuthWindowsOptions
    /**入参类型定义**/
    consumes: string[]
    /**出类型定义**/
    produces: string[]
    /**开启接口QPS控制：使用default配置**/
    skipThrottle: boolean
    /**开启接口QPS控制：使用自定义配置**/
    throttle: keyof typeof ThrottlerOptions | Parameters<typeof Throttle>['0']
}

export function ApiServiceDecorator(mthodRequest: MethodDecorator, options: Partial<ApiDecoratorOptions> = {}) {
    const consumes = options.consumes ?? ['application/json', 'application/x-www-form-urlencoded']
    const produces = options.produces ?? ['application/json', 'application/xml']
    const decorators: Array<any> = [
        mthodRequest,
        ApiOperation(options.operation),
        ApiResponse(options.response),
        ApiConsumes(...consumes),
        ApiProduces(...produces)
    ]
    if (options.skipThrottle) {
        decorators.push(SkipThrottle())
    } else if (isEmpty(options.throttle)) {
        decorators.push(Throttle({ default: ThrottlerOptions.default }))
    } else if (options.throttle && typeof options.throttle === 'string') {
        decorators.push(Throttle({ [options.throttle]: ThrottlerOptions[options.throttle] }))
    } else if (typeof options.throttle === 'object') {
        decorators.push(Throttle(options.throttle))
    }

    /**开启客户端登录校验**/
    if (options.clinet && isNotEmpty(options.clinet)) {
        decorators.push(ApiBearerAuth('authorization'), ApiClientGuardReflector(options.clinet))
    } else if (options.windows && isNotEmpty(options.windows)) {
        /**开启管理端登录校验**/
        decorators.push(ApiBearerAuth('authorization'), ApiWindowsGuardReflector(options.windows))
    }

    return applyDecorators(...decorators)
}
