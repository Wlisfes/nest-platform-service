import { Controller, Post, Get, Body, Request, Response } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ApiDecorator } from '@/decorator/request.decorator'
import { OmixRequest } from '@/interface/instance.resolver'
import { Logger } from '@/modules/logger/logger.service'
import { UserService } from '@web-system-service/modules/user/user.service'
import * as dtoUser from '@web-system-service/interface/user.resolver'

@ApiTags('账号模块')
@Controller('user')
export class UserController extends Logger {
    constructor(private readonly userService: UserService) {
        super()
    }

    @Post('/common/codex')
    @ApiDecorator({
        operation: { summary: '图形验证码' },
        response: { status: 200, description: 'OK' }
    })
    public async httpCommonCodexUser(@Request() request: OmixRequest, @Response() response) {
        return await this.userService.httpCommonCodexUser(response)
    }

    @Post('/create/system')
    @ApiDecorator({
        operation: { summary: '账号登录' },
        response: { status: 200, description: 'OK' }
    })
    public async httpCommonCreateSystemUser(@Request() request: OmixRequest, @Body() body: dtoUser.CreateSystemUser) {
        return await this.userService.httpCommonCreateSystemUser(request, body)
    }

    @Post('/create/customer')
    @ApiDecorator({
        operation: { summary: '创建基本账号' },
        response: { status: 200, description: 'OK' }
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

    @Post('/login')
    @ApiDecorator({
        operation: { summary: '账号登录' },
        response: { status: 200, description: 'OK' }
    })
    public async httpAuthorizeUser(@Request() request: OmixRequest, @Body() body) {
        this.logger.info('httpUserAuthorize', {
            duration: '50ms'
        })
        return { token: 'dasdasdas' }
    }
}
