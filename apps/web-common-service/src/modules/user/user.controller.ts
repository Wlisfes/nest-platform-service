import { Controller, Post, Get, Body, Request, Response } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ApiDecorator } from '@/decorator/request.decorator'
import { OmixRequest } from '@/interface/instance.resolver'
import { CodexService } from '@/modules/common/codex.service'
import { UserService } from '@web-common-service/modules/user/user.service'
import * as dtoUser from '@web-common-service/interface/user.resolver'

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

    @Post('/create/system')
    @ApiDecorator({
        operation: { summary: '创建系统账号' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpCommonCreateSystemUser(@Request() request: OmixRequest, @Body() body: dtoUser.CommonCreateSystemUser) {
        return await this.userService.httpCommonCreateSystemUser(request, body)
    }

    @Post('/create/customer')
    @ApiDecorator({
        operation: { summary: '创建基本账号' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpCommonCreateCustomer(@Request() request: OmixRequest, @Body() body: dtoUser.CommonCreateCustomer) {
        return await this.userService.httpCommonCreateCustomer(request, body)
    }

    @Post('/register/customer')
    @ApiDecorator({
        operation: { summary: '注册基本账号' },
        response: { status: 200, description: 'OK' },
        authorize: { platform: 'client' }
    })
    public async httpCommonRegisterCustomer(@Request() request: OmixRequest, @Body() body: dtoUser.CommonRegisterCustomer) {
        return await this.userService.httpCommonRegisterCustomer(request, body)
    }

    @Post('/token/authorize')
    @ApiDecorator({
        operation: { summary: '账号登录' },
        response: { status: 200, description: 'OK' },
        authorize: { platform: ['client', 'manager'] }
    })
    public async httpCommonUserAuthorize(@Request() request: OmixRequest, @Body() body: dtoUser.CommonUserAuthorize) {
        return await this.userService.httpCommonUserAuthorize(request, body)
    }

    @Get('/token/resolver')
    @ApiDecorator({
        operation: { summary: '获取账号基本信息' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: ['client', 'manager'] }
    })
    public async httpCommonUserResolver(@Request() request: OmixRequest) {
        return await this.userService.httpCommonUserResolver(request)
    }
}
