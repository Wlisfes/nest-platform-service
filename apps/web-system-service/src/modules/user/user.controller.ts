import { Controller, Post, Get, Body, Request, Response } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ApiDecorator } from '@/decorator/request.decorator'
import { OmixRequest } from '@/interface/instance.resolver'
import { Logger } from '@/modules/logger/logger.service'
import { UserService } from '@web-system-service/modules/user/user.service'

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
