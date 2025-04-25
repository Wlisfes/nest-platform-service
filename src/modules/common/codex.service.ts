import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Logger, AutoMethodDescriptor } from '@/modules/logger/logger.service'
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
    @AutoMethodDescriptor
    public async httpCommonCodexWrite(
        request: OmixRequest,
        response: Response,
        opts: Omix<{ key: string; cookie: string; deplayName?: string }>
    ) {
        const logger = await this.fetchServiceLoggerTransaction(request, { deplayName: this.deplayName })
        return await plugin.fetchCommonCodexer({ width: 120, height: 40 }).then(async ({ sid, text, data }) => {
            const key = await this.redisService.fetchCompose(opts.key, { sid })
            const { seconds } = await this.redisService.setStore(request, {
                key,
                data: text,
                seconds: 300,
                deplayName: this.deplayName
            })
            logger.info({ message: '图形验证码发送成功', seconds, key, data: text })
            await response.cookie(opts.cookie, sid, { httpOnly: true, maxAge: 300 * 1000 })
            await response.type('svg')
            return await response.send(data)
        })
    }

    /**验证请求头图形验证码sid**/
    @AutoMethodDescriptor
    public async fetchCommonCodexReader(request: OmixRequest, key: string): Promise<string> {
        if (isEmpty(request.cookies[key])) {
            throw new HttpException(`验证码不存在`, HttpStatus.BAD_REQUEST)
        }
        return request.cookies[key]
    }

    /**校验redis验证码**/
    @AutoMethodDescriptor
    public async httpCommonCodexCheck(request: OmixRequest, opts: Omix<{ key: string; code: string }>) {
        return await this.redisService.getStore<string>(request, { key: opts.key }).then(async code => {
            if (isEmpty(code) || opts.code.toUpperCase() !== code.toUpperCase()) {
                throw new HttpException(`验证码错误或已过期`, HttpStatus.BAD_REQUEST)
            }
            return await this.redisService.delStore(request, { key: opts.key, deplayName: this.deplayName })
        })
    }
}
