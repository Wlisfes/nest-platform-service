import { CanActivate, SetMetadata, ExecutionContext, Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { isEmpty, isNotEmpty, isString } from 'class-validator'
import { JwtService } from '@/modules/jwt/jwt.service'
import { Omix, OmixRequest } from '@/interface/instance.resolver'
import { SchemaUser } from '@/modules/database/database.schema'
import * as web from '@/config/web-common'

export interface AuthGuardOption {
    /**开启验证**/
    check?: boolean
    /**平台标识**/
    platform?: OmixRequest['platform'] | Array<OmixRequest['platform']>
}

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly reflector: Reflector, private readonly jwtService: JwtService) {}

    /**登录拦截入口**/
    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<OmixRequest>()
        const data = this.reflector.get<AuthGuardOption>(`APP_AUTH_INJECT`, context.getHandler())
        /**平台守卫拦截**/
        await this.fetchGuardPlatform(request, data)
        /**验证登录**/
        await this.fetchGuardUser(request, data)
        /**默认通过**/
        return true
    }

    /**平台守卫拦截**/
    public async fetchGuardPlatform(request: Omix<OmixRequest>, data: Omix<AuthGuardOption>) {
        const platform = request.headers[web.WEB_COMMON_HEADER_PLATFORM]
        if (data && isNotEmpty(data.platform) && (isString(data.platform) || (Array.isArray(data.platform) && data.platform.length > 0))) {
            if (isEmpty(platform)) {
                throw new HttpException('headers头部platform标识不能为空', HttpStatus.BAD_REQUEST)
            } else if (!data.platform.includes(platform)) {
                throw new HttpException('headers头部platform标识错误', HttpStatus.BAD_REQUEST)
            }
            return (request.platform = platform)
        }
        return true
    }

    /**用户守卫拦截**/
    public async fetchGuardUser(request: Omix<OmixRequest>, data: Omix<AuthGuardOption>) {
        const token = request.headers[web.WEB_COMMON_HEADER_AUTHORIZE]
        if (data && data.check) {
            return await this.jwtService.fetchJwtTokenParser<SchemaUser>(token).then(async node => {
                return (request.user = node)
            })
        }
        return request
    }
}

/**登录守卫、使用ApiGuardBearer守卫的接口会验证登录**/
export const ApiGuardBearer = (scope: AuthGuardOption) => SetMetadata(`APP_AUTH_INJECT`, scope)
