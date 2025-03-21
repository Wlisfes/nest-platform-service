import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Logger } from '@/modules/logger/logger.service'
import { RedisService } from '@/modules/redis/redis.service'
import { Omix, OmixRequest } from '@/interface/instance.resolver'
import { isEmpty } from 'class-validator'
import { Response } from 'express'
import * as plugin from '@/utils/utils-plugin'
import * as web from '@/config/web-common'

@Injectable()
export class CodexService extends Logger {
    constructor(private readonly redisService: RedisService) {
        super()
    }

    /**图形验证码**/
    public async httpSystemCommonCodex(response: Response) {
        return await plugin.fetchCommonCodexer({ width: 120, height: 40 }).then(async ({ sid, text, data }) => {
            const key = await this.redisService.fetchCompose(this.redisService.keys.COMMON_CODEX_ROBOT, { sid })
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

    /**验证请求头图形验证码sid**/
    public async fetchCommonRequestCodex(request: OmixRequest): Promise<string> {
        const sid = request.cookies[web.WEB_COMMON_HEADER_CAPHCHA]
        if (isEmpty(sid)) {
            throw new HttpException(`验证码不存在`, HttpStatus.BAD_REQUEST)
        }
        return sid
    }

    /**校验redis验证码**/
    public async httpSystemValidateCodex(request: OmixRequest, option: Omix<{ kyes: Array<string>; data: Omix; code: string }>) {
        const key = await this.redisService.fetchCompose(...option.kyes, option.data)
        return await this.redisService.getStore<string>({ key }).then(async code => {
            if (isEmpty(code) || option.code.toUpperCase() !== code.toUpperCase()) {
                throw new HttpException(`验证码错误或已过期`, HttpStatus.BAD_REQUEST)
            }
            return await this.redisService.delStore({ key })
        })
    }
}
