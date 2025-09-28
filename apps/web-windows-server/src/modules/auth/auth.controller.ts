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
        operation: { summary: '账户登录' },
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

    @ApiServiceDecorator(Get('/token/resolver'), {
        operation: { summary: '登录账户信息' },
        response: { status: 200, description: 'OK' },
        windows: true
    })
    public async httpAuthAccountTokenResolver(@Request() request: OmixRequest) {
        return await this.authService.httpAuthAccountTokenResolver(request)
    }

    @ApiServiceDecorator(Get('/token/resource'), {
        operation: { summary: '账户权限菜单' },
        response: { status: 200, description: 'OK' },
        windows: true
    })
    public async httpAuthAccountTokenResource(@Request() request: OmixRequest) {
        return await this.authService.httpAuthAccountTokenResource(request)
    }

    @ApiServiceDecorator(Get('/token/sheet'), {
        operation: { summary: '账户权限按钮' },
        response: { status: 200, description: 'OK' },
        windows: true
    })
    public async httpAuthAccountTokenSheet(@Request() request: OmixRequest) {
        return await this.authService.httpAuthAccountTokenSheet(request)
    }
}
