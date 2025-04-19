import { Injectable } from '@nestjs/common'
import { Logger, AutoMethodDescriptor } from '@/modules/logger/logger.service'
import { RedisService } from '@/modules/redis/redis.service'
import { CodexService } from '@/modules/common/codex.service'
import { Omix, OmixRequest, OmixResponse } from '@/interface/instance.resolver'

@Injectable()
export class DeployCodexService extends Logger {
    constructor(private readonly redisService: RedisService, private readonly codexService: CodexService) {
        super()
    }

    /**昆仑登录图形验证码----------------------------------------------------------------------------------**/
    @AutoMethodDescriptor
    public async httpDeployCodexTokenWrite(request: OmixRequest, response: OmixResponse) {
        return await this.codexService.httpCommonCodexWrite(request, response, {
            key: 'deploy:codex:token:{sid}',
            cookie: 'x-deploy-token-write-sid'
        })
    }

    /**验证昆仑登录图形验证码**/
    @AutoMethodDescriptor
    public async httpDeployCodexTokenCheckReader(request: OmixRequest, body: Omix<{ code: string }>) {
        const sid = await this.codexService.fetchCommonCodexReader(request, 'x-deploy-token-write-sid')
        return await this.codexService.httpCommonCodexCheck(request, {
            key: await this.redisService.fetchCompose('deploy:codex:token:{sid}', { sid }),
            code: body.code
        })
    }
}
