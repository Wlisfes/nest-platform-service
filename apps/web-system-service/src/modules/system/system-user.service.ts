import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { compareSync } from 'bcryptjs'
import { Logger } from '@/modules/logger/logger.service'
import { RedisService } from '@/modules/redis/redis.service'
import { JwtService } from '@/modules/jwt/jwt.service'
import { CodexService } from '@/modules/common/codex.service'
import { DatabaseService } from '@/modules/database/database.service'
import { Omix, OmixRequest } from '@/interface/instance.resolver'
import * as field from '@web-system-service/interface/instance.resolver'
import * as schema from '@/modules/database/database.schema'
import * as enums from '@/modules/database/database.enums'
import * as keys from '@/modules/redis/redis.keys'
import * as plugin from '@/utils/utils-plugin'
import * as utils from '@/utils/utils-common'

@Injectable()
export class SystemUserService extends Logger {
    constructor(
        private readonly httpService: HttpService,
        private readonly jwtService: JwtService,
        private readonly redisService: RedisService,
        private readonly codexService: CodexService,
        private readonly database: DatabaseService
    ) {
        super()
    }

    /**刷新redis用户账号缓存**/
    public async fetchRedisUpdateSystemUser(uid: string) {
        return await this.database.fetchConnectBuilder(this.database.schemaUser, async qb => {
            qb.where(`t.uid = :uid`, { uid })
            return await qb.getOne().then(async node => {
                await this.redisService.setStore({
                    data: node.status,
                    key: await this.redisService.fetchCompose(keys.COMMON_SYSTEM_USER_STATUS, { uid })
                })
                return node
            })
        })
    }

    /**新增用户账号**/
    public async httpBaseCreateSystemUser(request: OmixRequest, body: field.BaseCreateSystemUser) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
            await this.database.fetchConnectNull(this.database.schemaUser, {
                message: `number:${body.name} 已存在`,
                dispatch: { where: { number: body.number } }
            })
            await this.database.fetchConnectNull(this.database.schemaUser, {
                message: `phone:${body.name} 已存在`,
                dispatch: { where: { phone: body.phone } }
            })
            await this.database.fetchConnectCreate(this.database.schemaUser, {
                body: Object.assign(body, { uid: await utils.fetchIntNumber() })
            })
            return await ctx.commitTransaction().then(async () => {
                return await this.fetchResolver({ message: '新增成功' })
            })
        } catch (err) {
            await ctx.rollbackTransaction()
            return await this.fetchCatchCompiler('SystemUserService:httpBaseCreateSystemUser', err)
        } finally {
            await ctx.release()
        }
    }

    /**授权登录**/
    public async httpBaseCreateSystemUserAuthorize(request: OmixRequest, body: field.BaseCreateSystemUserAuthorize) {
        try {
            await this.codexService.fetchCommonCodexReader(request, 'x-request-captcha-sid').then(async sid => {
                return await this.codexService.httpCommonCodexCheck(request, {
                    key: await this.redisService.fetchCompose(this.redisService.keys.COMMON_CODEX_USER_TOKEN, { sid }),
                    code: body.code
                })
            })
            return await this.database.fetchConnectBuilder(this.database.schemaUser, async qb => {
                qb.addSelect('t.password')
                qb.where(`t.number = :number OR t.phone = :number OR t.email = :number`, { number: body.number })
                return await qb.getOne().then(async node => {
                    if (utils.isEmpty(node)) {
                        throw new HttpException(`账号不存在`, HttpStatus.BAD_REQUEST)
                    } else if (!compareSync(body.password, node.password)) {
                        throw new HttpException(`账号密码不正确`, HttpStatus.BAD_REQUEST)
                    } else if (node.status === enums.SchemaUser_Status.disable) {
                        throw new HttpException(`账号已被禁用`, HttpStatus.BAD_REQUEST)
                    }
                    return await this.jwtService.fetchJwtTokenSecret(utils.pick(node, ['uid', 'number', 'name', 'status']))
                })
            })
        } catch (err) {
            return await this.fetchCatchCompiler('SystemUserService:httpBaseCreateSystemUserAuthorize', err)
        }
    }

    /**编辑账号状态**/
    public async httpBaseUpdateSwitchSystemUser(request: OmixRequest, body: field.BaseSwitchSystemUser) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
            await this.database.fetchConnectNotNull(this.database.schemaUser, {
                message: `uid:${body.uid} 不存在`,
                dispatch: { where: { uid: body.uid } }
            })
            await this.database.fetchConnectUpdate(this.database.schemaUser, {
                where: { uid: body.uid },
                body: { status: body.status }
            })
            return await ctx.commitTransaction().then(async () => {
                return await this.fetchResolver({ message: '操作成功' })
            })
        } catch (err) {
            await ctx.rollbackTransaction()
            return await this.fetchCatchCompiler('SystemUserService:httpBaseUpdateSwitchSystemUser', err)
        } finally {
            await ctx.release()
        }
    }

    /**获取账号基本信息**/
    public async httpBaseSystemUserResolver(request: OmixRequest) {
        try {
            return await this.database.fetchConnectNotNull(this.database.schemaUser, {
                message: `uid:${request.user.uid} 不存在`,
                dispatch: { where: { uid: request.user.uid } }
            })
        } catch (err) {
            return await this.fetchCatchCompiler('UserService:httpCommonUserResolver', err)
        }
    }
}
