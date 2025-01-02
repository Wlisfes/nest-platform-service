import { CanActivate, SetMetadata, ExecutionContext, Injectable, HttpException, HttpStatus, Request } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@/modules/jwt/jwt.service'
import { Omix } from '@/interface/instance.resolver'
import { SchemaUser } from '@/modules/database/database.schema'
import * as web from '@/config/web-common'

export interface AuthGuardOption {
    /**开启验证**/
    check: boolean
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
            request.user = await this.fetchGuardUser(token, request)
        } else {
            request.user = {}
        }
        return true
    }

    /**消费用户守卫拦截**/
    public async fetchGuardUser(token: string, request: Omix<Request>) {
        return await this.jwtService.fetchJwtTokenParser<SchemaUser>(token).then(async node => {
            return node
        })
    }
}

/**登录守卫、使用ApiGuardBearer守卫的接口会验证登录**/
export const ApiGuardBearer = (scope: AuthGuardOption) => SetMetadata(`APP_AUTH_INJECT`, scope)
