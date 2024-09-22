import { CanActivate, SetMetadata, ExecutionContext, Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
// import { CustomService } from '@/services/custom.service'
import * as web from '@/config/web-instance'
import * as env from '@/interface/instance.resolver'

export interface IGuardOption {
    check: boolean
    next?: boolean
    baseURL?: boolean
}

export interface AuthGuardOption {
    /**验证类型**/
    source: 'client' | 'manager'
    /**开启验证**/
    check: boolean
    /**验证异常是否继续执行**/
    next?: boolean
}

@Injectable()
export class AuthGuard implements CanActivate {
    // constructor(private readonly reflector: Reflector, private readonly custom: CustomService) {}
    constructor(private readonly reflector: Reflector) {}

    /**异常拦截处理**/
    public async httpContextAuthorize(next: boolean, scope: Partial<env.Omix<{ message: string; status: number }>>) {
        if (!next) {
            throw new HttpException(scope.message ?? '登录已失效', scope.status ?? HttpStatus.UNAUTHORIZED)
        }
        return false
    }

    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest()
        const scope = this.reflector.get<AuthGuardOption>(`APP_AUTH_INJECT`, context.getHandler())
        const baseURL = request.route.path

        /**验证登录**/
        if (scope && scope.check) {
            const token = request.headers[web.WEB_COMMON_HEADER_AUTHORIZE]
            if (!token) {
                //未携带token
                await this.httpContextAuthorize(scope.next ?? false, { message: '未登录' })
            } else {
                /**解析token**/
                // const node = await this.custom.divineJwtTokenParser(token, { message: '身份验证失败' })
                // request.user = node
            }
        }
        return true
    }
}

/**登录守卫、使用ApiGuardBearer守卫的接口会验证登录**/
export const ApiGuardBearer = (scope: AuthGuardOption) => SetMetadata(`APP_AUTH_INJECT`, scope)
