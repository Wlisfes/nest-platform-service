import { CanActivate, SetMetadata, ExecutionContext, Injectable, HttpException, HttpStatus, Request } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@/modules/jwt/jwt.service'
import { Omix } from '@/interface/instance.resolver'
import * as web from '@/config/web-common'

export interface AuthGuardOption {
    /**开启验证**/
    check: boolean
    /**验证异常是否继续执行**/
    next?: boolean
}

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly reflector: Reflector, private readonly jwtService: JwtService) {}

    /**登录拦截入口**/
    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest()
        const scope = this.reflector.get<AuthGuardOption>(`APP_AUTH_INJECT`, context.getHandler())
        const token = request.headers[web.WEB_COMMON_HEADER_AUTHORIZE]
        /**验证登录**/
        if (scope && scope.check) {
            await this.fetchGuardUser(token, scope.next ?? false, request)
        }
        return true
    }

    /**消费用户守卫拦截**/
    public async fetchGuardUser(token: string, next: boolean, request: Omix<Request>) {}
}

/**登录守卫、使用ApiGuardBearer守卫的接口会验证登录**/
export const ApiGuardBearer = (scope: AuthGuardOption) => SetMetadata(`APP_AUTH_INJECT`, scope)
