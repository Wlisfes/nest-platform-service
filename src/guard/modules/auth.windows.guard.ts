import { CanActivate, SetMetadata, ExecutionContext, Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { isObject, isBoolean, isNotEmpty } from 'class-validator'
import { JwtService } from '@/modules/jwt/jwt.service'
import { RedisService } from '@/modules/redis/redis.service'
import { WindowsService } from '@/modules/database/database.schema'
import { Reflector } from '@nestjs/core'
import { OmixRequest } from '@/interface'
import { APP_REQUIRE_PERMISSION_CONTEXT } from '@/decorator/modules/permission.decorator'
import { In } from 'typeorm'

export interface AuthWindowsOptions {
    /**验证失败是否继续执行**/
    next: boolean
}

const PERMISSION_CACHE_TTL = 300

@Injectable()
export class AuthWindowsGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly jwtService: JwtService,
        private readonly redis: RedisService,
        private readonly windows: WindowsService
    ) {}

    /**默认配置**/
    public async fetchCtxOptions(context: ExecutionContext, request: OmixRequest) {
        const token = (request.headers.authorization ?? '').replace(/^Bearer\s+/i, '')
        const node = this.reflector.get<boolean | AuthWindowsOptions>(`APP_AUTH_WINDOWS_CONTEXT`, context.getHandler())
        if (isNotEmpty(node) && isObject(node)) {
            return { check: true, next: node.next, token }
        } else if (isNotEmpty(node) && isBoolean(node)) {
            return { check: true, next: false, token }
        }
        return { check: false, next: false, token }
    }

    /**token解析**/
    public async fetchGuardHandler(request: Omix<OmixRequest>, token: string, options: AuthWindowsOptions) {
        try {
            request.user = await this.jwtService.fetchJwtParser(token)
        } catch (err) {
            if (!options.next) {
                throw new HttpException(err.message ?? '身份验证失败', err.status ?? HttpStatus.UNAUTHORIZED)
            }
            return err
        }
    }

    /**从Redis或数据库加载用户权限**/
    public async fetchUserPermissions(request: Omix<OmixRequest>): Promise<string[]> {
        if (!isNotEmpty(request.user?.uid)) {
            return []
        }
        const uid = request.user.uid
        const cacheKey = `windows:permissions:${uid}`

        const cached = await this.redis.getStore<string[]>(request, { key: cacheKey, defaultValue: null })
        if (cached !== null) {
            return cached
        }

        const roleAccounts = await this.windows.roleAccount.find({ where: { uid } })
        const roleIds = roleAccounts.map(ra => ra.roleId)
        if (roleIds.length === 0) {
            await this.redis.setStore(request, { key: cacheKey, data: [], seconds: PERMISSION_CACHE_TTL })
            return []
        }

        const [resources, sheets, apifoxes] = await Promise.all([
            this.windows.roleResource.find({ where: { roleId: In(roleIds) } }),
            this.windows.roleSheet.find({ where: { roleId: In(roleIds) } }),
            this.windows.roleApifox.find({ where: { roleId: In(roleIds) } })
        ])

        const resourceIds = [...new Set(resources.map(r => r.sid))]
        const sheetIds = [...new Set(sheets.map(s => s.sheetId))]
        const apifoxIds = [...new Set(apifoxes.map(a => a.apifoxId))]

        const [menuKeys, sheetKeys, apifoxKeys] = await Promise.all([
            resourceIds.length > 0
                ? this.windows.resource.find({ where: { keyId: In(resourceIds) } }).then(list => list.map(m => m.key))
                : Promise.resolve([]),
            sheetIds.length > 0
                ? this.windows.resourceSheet.find({ where: { keyId: In(sheetIds) } }).then(list => list.map(s => s.key))
                : Promise.resolve([]),
            apifoxIds.length > 0
                ? this.windows.resourceApifox.find({ where: { keyId: In(apifoxIds) } }).then(list => list.map(a => `${a.path}:${a.method}`))
                : Promise.resolve([])
        ])

        const permissions = [...new Set([...menuKeys, ...sheetKeys, ...apifoxKeys].filter(Boolean))]
        await this.redis.setStore(request, { key: cacheKey, data: permissions, seconds: PERMISSION_CACHE_TTL })
        return permissions
    }

    /**校验权限**/
    public async checkPermissions(context: ExecutionContext, request: Omix<OmixRequest>): Promise<void> {
        const requiredKeys = this.reflector.get<string[]>(APP_REQUIRE_PERMISSION_CONTEXT, context.getHandler())
        if (!requiredKeys || requiredKeys.length === 0) {
            return
        }
        const userPerms = request.permissions ?? []
        const hasPermission = requiredKeys.some(key => userPerms.includes(key))
        if (!hasPermission) {
            throw new HttpException('无操作权限', HttpStatus.FORBIDDEN)
        }
    }

    /**登录拦截入口**/
    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<OmixRequest>()
        return await this.fetchCtxOptions(context, request).then(async data => {
            if (data.check) {
                await this.fetchGuardHandler(request, data.token, data)
                request.permissions = await this.fetchUserPermissions(request)
                await this.checkPermissions(context, request)
            }
            return true
        })
    }
}

/**登录守卫、使用ApiWindowsGuardReflector守卫的接口会验证登录**/
export const ApiWindowsGuardReflector = (options: boolean | AuthWindowsOptions) => {
    return SetMetadata(`APP_AUTH_WINDOWS_CONTEXT`, options)
}
