import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Logger } from '@/modules/logger/logger.service'
import { RedisService } from '@/modules/redis/redis.service'
import { Omix } from '@/interface/instance.resolver'
import { Response } from 'express'
import * as utils from '@/utils/utils-common'
import * as plugin from '@/utils/utils-plugin'
import * as web from '@/config/web-common'

@Injectable()
export class CodexService extends Logger {
    constructor(
        // private readonly jwtService: JwtService,
        private readonly redisService: RedisService
    ) {
        super()
    }

    /**图形验证码**/
    public async httpSystemCommonCodex(response: Response) {
        return await plugin.fetchCommonCodexer({ width: 120, height: 40 }).then(async ({ sid, text, data }) => {
            const key = await this.redisService.fetchCompose(this.redisService.keys.COMMON_USER_LOGIN_CODEX, sid)
            return await this.redisService.setStore({ key, data: text, seconds: 300 }).then(async ({ seconds }) => {
                this.logger.info('SystemService:httpSystemCommonCodex', {
                    log: { message: '图形验证码发送成功', seconds, key, data: text }
                })
                await response.cookie(web.WEB_COMMON_HEADER_CAPHCHA, sid, { httpOnly: true })
                await response.type('svg')
                return await response.send(data)
            })
        })
    }
}
