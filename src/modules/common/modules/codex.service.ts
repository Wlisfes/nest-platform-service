import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { RedisService } from '@/modules/redis/redis.service'
import { fetchIntNumber } from '@/utils'
import { isEmpty } from 'class-validator'
import { create } from 'svg-captcha'
import * as env from '@/interface'

@Injectable()
export class CodexService extends Logger {
    /**图形验证码redis缓存键**/
    protected readonly keyName: string = `windows:common-codex:{sid}`
    /**图形验证码cookie存储键**/
    protected readonly cookieName: string = `x-windows-common-codex-sid`

    constructor(private readonly redisService: RedisService) {
        super()
    }

    /**
     * 写入图形验证码
     * @param request Request对象
     * @param body 图形验证码基础配置
     */
    @AutoDescriptor
    public async httpBaseCommonCodexWrite(request: env.OmixRequest, response: env.OmixResponse, options: env.CodexWriteOptions) {
        return await this.fetchBaseCommonCodexCreate(request, options.body).then(async ({ sid, text, data }) => {
            const key = await this.redisService.compose(request, this.keyName, { sid })
            const { seconds } = await this.redisService.setStore(request, {
                stack: this.stack,
                key,
                data: text,
                seconds: 300
            })
            this.logger.info({ message: '图形验证码发送成功', seconds, key, data: text })
            await response.cookie(this.cookieName, sid, { httpOnly: true, maxAge: 300 * 1000 })
            await response.type('svg')
            return await response.send(data)
        })
    }

    /**
     * 创建图形验证码
     * @param body 基础配置
     */
    @AutoDescriptor
    public async fetchBaseCommonCodexCreate(request: env.OmixRequest, body: env.CodexCreateOptions) {
        return await fetchIntNumber().then(async sid => {
            const { text, data } = create({
                charPreset: `ABCDEFGHJKLMNPQRSTUVWXYZ123456789`,
                width: body.width ?? 120,
                height: body.height ?? 40,
                fontSize: body.fontSize ?? 40,
                inverse: [1, '1'].includes(body.inverse),
                noise: 2
            })
            return Object.assign(body, { sid, text, data })
        })
    }

    /**
     * 验证请求头图形验证码sid
     * @param request Request对象
     * @param key cookie中存储sid的字段
     */
    @AutoDescriptor
    public async fetchBaseCommonCookiesCodex(request: env.OmixRequest, body: env.BaseCommonCookiesCodex) {
        if (isEmpty(request.cookies[this.cookieName])) {
            throw new HttpException(`验证码不存在`, HttpStatus.BAD_REQUEST)
        }
        const key = await this.redisService.compose(request, this.keyName, { sid: request.cookies[this.cookieName] })
        return await this.redisService.getStore<string>(request, { key }).then(async code => {
            if (isEmpty(code) || body.code.toUpperCase() !== code.toUpperCase()) {
                throw new HttpException(`验证码错误或已过期`, HttpStatus.BAD_REQUEST)
            }
            return await this.redisService.delStore(request, { key, stack: this.stack }).then(() => {
                return true
            })
        })
    }
}
