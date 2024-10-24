import { CanActivate, SetMetadata, ExecutionContext, Injectable, HttpException, HttpStatus, Request } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { DatabaseService } from '@/services/database.service'
import { JwtService } from '@/services/jwt.service'
import { fetchHandler } from '@/utils/utils-common'
import { isEmpty } from 'class-validator'
import * as web from '@/config/web-instance'
import { Omix } from '@/interface/instance.resolver'

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
    constructor(
        private readonly reflector: Reflector,
        private readonly jwtService: JwtService,
        private readonly databaseService: DatabaseService
    ) {}

    /**异常拦截处理**/
    public async httpContextAuthorize(next: boolean, scope: Partial<Omix<{ message: string; status: number }>>) {
        if (!next) {
            throw new HttpException(scope.message ?? '身份验证失败', scope.status ?? HttpStatus.UNAUTHORIZED)
        }
        return false
    }

    /**登录拦截入口**/
    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest()
        const scope = this.reflector.get<AuthGuardOption>(`APP_AUTH_INJECT`, context.getHandler())
        const baseURL = request.route.path

        /**验证登录**/
        if (scope && scope.check) {
            const token = request.headers[web.WEB_COMMON_HEADER_AUTHORIZE]
            if (scope.source === 'manager') {
                await this.fetchGuardMember(token, scope.next ?? false, request)
            } else if (scope.source === 'client') {
                await this.fetchGuardUser(token, scope.next ?? false, request)
            }
        }
        return true
    }

    /**员工守卫拦截**/
    public async fetchGuardMember(token: string, next: boolean, request: Omix<Request>) {
        if (isEmpty(token)) {
            return await this.httpContextAuthorize(next, { message: '未登录' })
        }
        return (request.member = await this.jwtService.fetchJwtTokenParser(token))
    }

    /**消费用户守卫拦截**/
    public async fetchGuardUser(token: string, next: boolean, request: Omix<Request>) {
        // await this.httpContextAuthorize(next, { message: '未登录' })
    }
}

/**登录守卫、使用ApiGuardBearer守卫的接口会验证登录**/
export const ApiGuardBearer = (scope: AuthGuardOption) => SetMetadata(`APP_AUTH_INJECT`, scope)
