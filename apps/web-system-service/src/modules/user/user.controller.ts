import { Controller, Post, Get, Body, Request, Response } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ApiDecorator } from '@/decorator/request.decorator'
import { OmixRequest } from '@/interface/instance.resolver'
import { Logger } from '@/modules/logger/logger.service'

@ApiTags('账号模块')
@Controller('user')
export class UserController extends Logger {
    constructor() {
        super()
    }

    @Post('/login')
    @ApiDecorator({
        operation: { summary: '账号登录' },
        response: { status: 200, description: 'OK' }
    })
    public async httpUserAuthorize(@Request() request: OmixRequest, @Body() body) {
        this.logger.info('httpUserAuthorize', {
            duration: '50ms'
        })
        return { token: 'dasdasdas' }
    }
}
