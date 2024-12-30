import { ApiOperationOptions, ApiResponseOptions, getSchemaPath, ApiExtraModels } from '@nestjs/swagger'
import { ApiOperation, ApiConsumes, ApiProduces, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { applyDecorators, Type } from '@nestjs/common'
import { Throttle, SkipThrottle } from '@nestjs/throttler'
import { isEmpty } from 'class-validator'
import { ApiGuardBearer, AuthGuardOption } from '@/guard/auth.guard'
import * as web from '@/config/web-common'
import * as thr from '@/config/web-throttle'

export interface OptionDecorator {
    operation: ApiOperationOptions
    response: ApiResponseOptions
    customize: { status: number; description: string; type: Type<unknown> }
    authorize: AuthGuardOption
    consumes: string[]
    produces: string[]
    skipThrottle: boolean
    throttle: keyof typeof thr.WEB_THROTTLE | Parameters<typeof Throttle>['0']
}

export function ApiDecorator(option: Partial<OptionDecorator> = {}) {
    const consumes = option.consumes ?? ['application/x-www-form-urlencoded', 'application/json']
    const produces = option.produces ?? ['application/json', 'application/xml']
    const decorator: Array<any> = [ApiOperation(option.operation), ApiConsumes(...consumes), ApiProduces(...produces)]

    if (option.skipThrottle) {
        decorator.push(SkipThrottle())
    } else if (isEmpty(option.throttle)) {
        decorator.push(Throttle({ default: thr.WEB_THROTTLE.default }))
    } else if (option.throttle && typeof option.throttle === 'string') {
        decorator.push(Throttle({ [option.throttle]: thr.WEB_THROTTLE[option.throttle] }))
    } else if (typeof option.throttle === 'object') {
        decorator.push(Throttle(option.throttle))
    }

    if (option.customize) {
        decorator.push(
            ApiExtraModels(option.customize.type),
            ApiResponse({
                status: option.customize.status,
                description: option.customize.description,
                schema: {
                    allOf: [
                        {
                            properties: {
                                page: { type: 'number', default: 1 },
                                size: { type: 'number', default: 10 },
                                total: { type: 'number', default: 0 },
                                list: {
                                    type: 'array',
                                    items: { $ref: getSchemaPath(option.customize.type) }
                                }
                            }
                        }
                    ]
                }
            })
        )
    } else {
        decorator.push(ApiResponse(option.response))
    }

    /**开启登录验证**/
    if (option.authorize && option.authorize.check) {
        decorator.push(ApiBearerAuth(web.WEB_COMMON_HEADER_AUTHORIZE), ApiGuardBearer(option.authorize))
    }

    return applyDecorators(...decorator)
}
