import { Controller, Get, Request, Response } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ApiDecorator } from '@/decorator/request.decorator'
import { OmixRequest } from '@/interface/instance.resolver'
import { RedisService } from '@/modules/redis/redis.service'
import { CodexService } from '@/modules/common/codex.service'

@ApiTags('验证码模块')
@Controller('codex')
export class CommonCodexController {
    constructor(private readonly redisService: RedisService, private readonly codexService: CodexService) {}

    @Get('/system/user/token')
    @ApiDecorator({
        operation: { summary: 'manager平台登录图形验证码' },
        response: { status: 200, description: 'OK' }
    })
    public async httpCommonCodexWriteUserAuthorize(@Request() request: OmixRequest, @Response() response) {
        return await this.codexService.httpCommonCodexWrite(request, response, {
            key: this.redisService.keys.COMMON_CODEX_USER_TOKEN,
            cookie: 'x-request-captcha-sid'
        })
    }
}
