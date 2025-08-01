import { Post, Get, Body, Query, Request, Response } from '@nestjs/common'
import { ApifoxController, ApiServiceDecorator } from '@/decorator'
import { OmixRequest, CodexCreateOptions } from '@/interface'
import { AuthService } from '@web-windows-server/modules/auth/auth.service'
import * as windows from '@web-windows-server/interface'

@ApifoxController('授权模块', '/auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @ApiServiceDecorator(Get('/codex/write'), {
        operation: { summary: '图形验证码' },
        response: { status: 200, description: 'OK' }
    })
    public async httpAuthCodexWrite(@Request() request: OmixRequest, @Response() response, @Query() query: CodexCreateOptions) {
        return await this.authService.httpAuthCodexWrite(request, response, query)
    }

    @ApiServiceDecorator(Post('/token/login'), {
        operation: { summary: '账号登录' },
        response: { status: 200, description: 'OK' }
    })
    public async httpAuthAccountToken(@Request() request: OmixRequest, @Body() body: windows.AccountTokenOptions) {
        return await this.authService.httpAuthAccountToken(request, body)
    }

    @ApiServiceDecorator(Post('/token/continue'), {
        operation: { summary: '登录续时' },
        response: { status: 200, description: 'OK' },
        windows: true
    })
    public async httpAuthAccountTokenContinue(@Request() request: OmixRequest) {
        return await this.authService.httpAuthAccountTokenContinue(request)
    }
}
