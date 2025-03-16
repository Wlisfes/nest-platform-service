import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { isEmpty, isEmail } from 'class-validator'
import { compareSync } from 'bcryptjs'
import { Logger } from '@/modules/logger/logger.service'
import { RedisService } from '@/modules/redis/redis.service'
import { JwtService } from '@/modules/jwt/jwt.service'
import { CodexService } from '@/modules/common/codex.service'
import { DatabaseService } from '@/modules/database/database.service'
import { OmixRequest } from '@/interface/instance.resolver'
import * as dtoUser from '@web-common-service/interface/user.resolver'
import * as enums from '@/modules/database/database.enums'
import * as utils from '@/utils/utils-common'
import * as _ from 'lodash'

@Injectable()
export class UserService extends Logger {
    constructor(
        private readonly jwtService: JwtService,
        private readonly redisService: RedisService,
        private readonly codexService: CodexService,
        private readonly database: DatabaseService
    ) {
        super()
    }

    /**生成不重复账号**/
    private async fetchCreateAccountIntNumber(): Promise<number> {
        return await utils.fetchIntNumber({ random: true, bit: 8 }).then(async account => {
            return await this.database.fetchConnectBuilder(this.database.schemaUser, async qb => {
                qb.where(`t.account = :account`, { account })
                return await qb.getOne().then(async node => {
                    if (isEmpty(node)) {
                        return Number(account)
                    }
                    return await this.fetchCreateAccountIntNumber()
                })
            })
        })
    }

    /**刷新redis用户缓存**/
    public async fetchRedisUpdateUser(uid: string) {
        return await this.database.fetchConnectBuilder(this.database.schemaUser, async qb => {
            qb.where(`t.uid = :uid`, { uid })
            return await qb.getOne().then(async node => {
                await this.redisService.setStore({
                    data: node.status,
                    key: await this.redisService.fetchCompose(this.redisService.keys.COMMON_USER_STATUS, { uid })
                })
                await this.redisService.setStore({
                    data: node,
                    key: await this.redisService.fetchCompose(this.redisService.keys.COMMON_USER_NODE, { uid })
                })
                return node
            })
        })
    }

    /**创建系统账号**/
    public async httpCommonCreateSystemUser(request: OmixRequest, body: dtoUser.CommonCreateSystemUser) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
            await this.database.fetchConnectNull(this.database.schemaUser, {
                message: `${body.account} 已存在`,
                dispatch: {
                    where: { account: body.account }
                }
            })
            await this.database.fetchConnectCreate(this.database.schemaUser, {
                body: {
                    uid: await utils.fetchIntNumber(),
                    system: true,
                    account: body.account,
                    nickname: body.nickname,
                    password: body.password
                }
            })
            return await ctx.commitTransaction().then(async () => {
                return await utils.fetchResolver({ message: '操作成功' })
            })
        } catch (err) {
            await ctx.rollbackTransaction()
            return await this.fetchCatchCompiler('UserService:httpCommonCreateSystemUser', err)
        } finally {
            await ctx.release()
        }
    }

    /**创建基本账号**/
    public async httpCommonCreateCustomer(request: OmixRequest, body: dtoUser.CommonCreateCustomer) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
            await this.database.fetchConnectNull(this.database.schemaUser, {
                message: `${body.email} 已存在`,
                dispatch: {
                    where: { email: body.email }
                }
            })
            return await this.fetchCreateAccountIntNumber().then(async account => {
                await this.database.fetchConnectCreate(this.database.schemaUser, {
                    body: {
                        uid: await utils.fetchIntNumber(),
                        system: false,
                        account: account,
                        email: body.email,
                        nickname: body.nickname,
                        password: Buffer.from('123456').toString('base64')
                    }
                })
                return await ctx.commitTransaction().then(async () => {
                    return await utils.fetchResolver({ message: '操作成功' })
                })
            })
        } catch (err) {
            await ctx.rollbackTransaction()
            return await this.fetchCatchCompiler('UserService:httpCommonCreateCustomer', err)
        } finally {
            await ctx.release()
        }
    }

    /**注册基本账号**/
    public async httpCommonRegisterCustomer(request: OmixRequest, body: dtoUser.CommonRegisterCustomer) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
            await this.codexService.httpSystemValidateCodex(request, {
                kyes: [this.redisService.keys.COMMON_CODEX_EMAIL],
                data: { email: body.email },
                code: body.code
            })
            await this.database.fetchConnectNull(this.database.schemaUser, {
                message: `${body.email} 已存在`,
                dispatch: {
                    where: { email: body.email }
                }
            })
            return await this.fetchCreateAccountIntNumber().then(async account => {
                await this.database.fetchConnectCreate(this.database.schemaUser, {
                    body: {
                        uid: await utils.fetchIntNumber(),
                        system: false,
                        account: account,
                        email: body.email,
                        nickname: body.nickname,
                        password: body.password
                    }
                })
                return await ctx.commitTransaction().then(async () => {
                    return await utils.fetchResolver({ message: '操作成功' })
                })
            })
        } catch (err) {
            await ctx.rollbackTransaction()
            return await this.fetchCatchCompiler('UserService:httpCommonRegisterCustomer', err)
        } finally {
            await ctx.release()
        }
    }

    /**账号登录**/
    public async httpCommonUserAuthorize(request: OmixRequest, body: dtoUser.CommonUserAuthorize) {
        try {
            await this.codexService.fetchCommonRequestCodex(request).then(async sid => {
                return await this.codexService.httpSystemValidateCodex(request, {
                    kyes: [this.redisService.keys.COMMON_CODEX_ROBOT],
                    data: { sid },
                    code: body.code
                })
            })
            return await this.database.fetchConnectBuilder(this.database.schemaUser, async qb => {
                qb.addSelect('t.password')
                if (isEmail(body.account)) {
                    qb.where(`t.email = :email`, { email: body.account })
                } else {
                    qb.where(`t.account = :account`, { account: body.account })
                }
                return await qb.getOne().then(async data => {
                    if (
                        isEmpty(data) ||
                        (data.system && request.platform === 'client') ||
                        (!data.system && request.platform === 'manager')
                    ) {
                        throw new HttpException(`账号不存在`, HttpStatus.BAD_REQUEST)
                    } else if (!compareSync(body.password, data.password)) {
                        throw new HttpException(`账号密码不正确`, HttpStatus.BAD_REQUEST)
                    } else if (data.status === enums.SchemaUser_Status.disable) {
                        throw new HttpException(`账号已被禁用`, HttpStatus.BAD_REQUEST)
                    }
                    await this.fetchRedisUpdateUser(data.uid)
                    return await this.jwtService.fetchJwtTokenSecret(_.pick(data, ['uid', 'account', 'nickname', 'system']))
                })
            })
        } catch (err) {
            return await this.fetchCatchCompiler('UserService:httpCommonUserAuthorize', err)
        }
    }

    /**获取账号基本信息**/
    public async httpCommonUserResolver(request: OmixRequest) {
        try {
            return await this.fetchRedisUpdateUser(request.user.uid)
        } catch (err) {
            return await this.fetchCatchCompiler('UserService:httpCommonUserResolver', err)
        }
    }
}
