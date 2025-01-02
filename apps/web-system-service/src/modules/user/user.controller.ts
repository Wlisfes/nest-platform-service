import { Controller, Post, Get, Body, Request, Response } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ApiDecorator } from '@/decorator/request.decorator'
import { OmixRequest } from '@/interface/instance.resolver'
import { UserService } from '@web-system-service/modules/user/user.service'
import { CodexService } from '@/modules/common/codex.service'
import * as dtoUser from '@web-system-service/interface/user.resolver'

@ApiTags('账号模块')
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService, private readonly codexService: CodexService) {}

    @Get('/system/codex')
    @ApiDecorator({
        operation: { summary: '图形验证码' },
        response: { status: 200, description: 'OK' }
    })
    public async httpSystemCommonCodex(@Request() request: OmixRequest, @Response() response) {
        return await this.codexService.httpSystemCommonCodex(response)
    }

    @Get('/base/resolver')
    @ApiDecorator({
        operation: { summary: '获取账号基本信息' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true }
    })
    public async httpCommonBaseResolver(@Request() request: OmixRequest) {
        return await this.userService.httpCommonBaseResolver(request)
    }

    @Post('/create/system')
    @ApiDecorator({
        operation: { summary: '创建系统账号' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true }
    })
    public async httpCommonCreateSystemUser(@Request() request: OmixRequest, @Body() body: dtoUser.CreateSystemUser) {
        return await this.userService.httpCommonCreateSystemUser(request, body)
    }

    @Post('/create/customer')
    @ApiDecorator({
        operation: { summary: '创建基本账号' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true }
    })
    public async httpCommonCreateCustomer(@Request() request: OmixRequest, @Body() body: dtoUser.CreateCustomer) {
        return await this.userService.httpCommonCreateCustomer(request, body)
    }

    @Post('/register/customer')
    @ApiDecorator({
        operation: { summary: '注册基本账号' },
        response: { status: 200, description: 'OK' }
    })
    public async httpCommonRegisterCustomer(@Request() request: OmixRequest, @Body() body: dtoUser.RegisterCustomer) {
        return await this.userService.httpCommonRegisterCustomer(request, body)
    }

    @Post('/token/authorize')
    @ApiDecorator({
        operation: { summary: '账号登录' },
        response: { status: 200, description: 'OK' }
    })
    public async httpCommonWriteAuthorize(@Request() request: OmixRequest, @Body() body: dtoUser.WriteAuthorize) {
        return await this.userService.httpCommonWriteAuthorize(request, body)
    }
}
