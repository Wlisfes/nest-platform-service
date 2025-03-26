import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Logger } from '@/modules/logger/logger.service'
import { RedisService } from '@/modules/redis/redis.service'
import { Omix, OmixRequest } from '@/interface/instance.resolver'
import { isEmpty } from 'class-validator'
import { Response } from 'express'
import * as plugin from '@/utils/utils-plugin'

@Injectable()
export class CodexService extends Logger {
    constructor(private readonly redisService: RedisService) {
        super()
    }

    /**图形验证码**/
    public async httpCommonCodexWrite(response: Response, opts: Omix<{ key: string; cookie: string }>) {
        return await plugin.fetchCommonCodexer({ width: 120, height: 40 }).then(async ({ sid, text, data }) => {
            const key = await this.redisService.fetchCompose(opts.key, { sid })
            return await this.redisService.setStore({ key, data: text, seconds: 300 }).then(async ({ seconds }) => {
                this.logger.info('SystemService:httpCommonCodexWrite', {
                    log: { message: '图形验证码发送成功', seconds, key, data: text }
                })
                await response.cookie(opts.cookie, sid, { httpOnly: true })
                await response.type('svg')
                return await response.send(data)
            })
        })
    }

    /**校验redis验证码**/
    public async httpCommonCodexCheck(request: OmixRequest, opts: Omix<{ key: string; code: string }>) {
        return await this.redisService.getStore<string>({ key: opts.key }).then(async code => {
            if (isEmpty(code) || opts.code.toUpperCase() !== code.toUpperCase()) {
                throw new HttpException(`验证码错误或已过期`, HttpStatus.BAD_REQUEST)
            }
            return await this.redisService.delStore({ key: opts.key })
        })
    }
}
