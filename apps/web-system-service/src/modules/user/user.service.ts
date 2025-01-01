import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Response } from 'express'
import { isEmpty } from 'class-validator'
import { Logger } from '@/modules/logger/logger.service'
import { RedisService } from '@/modules/redis/redis.service'
import { JwtService } from '@/modules/jwt/jwt.service'
import { DatabaseService } from '@/modules/database/database.service'
import { OmixRequest } from '@/interface/instance.resolver'
import * as dtoUser from '@web-system-service/interface/user.resolver'
import * as utils from '@/utils/utils-common'
import * as plugin from '@/utils/utils-plugin'
import * as web from '@/config/web-common'

@Injectable()
export class UserService extends Logger {
    constructor(
        private readonly jwtService: JwtService,
        private readonly redisService: RedisService,
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

    /**图形验证码**/
    public async httpCommonCodexUser(response: Response) {
        return await plugin.fetchCommonCodexer({ width: 120, height: 40 }).then(async ({ sid, text, data }) => {
            const key = await this.redisService.fetchCompose(this.redisService.keys.COMMON_USER_LOGIN_CODEX, sid)
            return await this.redisService.setStore({ key, data: text, seconds: 300 }).then(async ({ seconds }) => {
                this.logger.info('httpCommonCodexUser', {
                    log: { message: '图形验证码发送成功', seconds, key, data: text }
                })
                await response.cookie(web.WEB_COMMON_HEADER_CAPHCHA, sid, { httpOnly: true })
                await response.type('svg')
                return await response.send(data)
            })
        })
    }

    /**创建系统账号**/
    public async httpCommonCreateSystemUser(request: OmixRequest, body: dtoUser.CreateSystemUser) {
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
    public async httpCommonCreateCustomer(request: OmixRequest, body: dtoUser.CreateCustomer) {
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
    public async httpCommonRegisterCustomer(request: OmixRequest, body: dtoUser.RegisterCustomer) {}

    /**账号注册**/
    public async httpCommonRegister(request: OmixRequest) {
        try {
        } catch (err) {}
    }
}
