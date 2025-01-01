import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Response } from 'express'
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
                message: `${body.username}已存在`,
                // cause: { name: '11111111', dsadsad: 'r23423423' },
                dispatch: {
                    where: { username: body.username }
                }
            })
            return { name: 'dasdsa' }
        } catch (err) {
            await ctx.rollbackTransaction()
            return await this.fetchCatchCompiler('UserService:httpCommonCreateSystemUser', err)
        } finally {
            await ctx.release()
        }
    }

    /**创建基本账号**/
    public async httpCommonCreateCustomer(request: OmixRequest, body: dtoUser.CreateCustomer) {
        return { name: 'dasdsa' }
    }

    /**账号注册**/
    public async httpCommonRegister(request: OmixRequest) {
        try {
        } catch (err) {}
    }
}
