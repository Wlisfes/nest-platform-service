import { Controller, Post, Get, Body, Request } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ApiDecorator } from '@/decorator/request.decorator'
import { OmixRequest } from '@/interface/instance.resolver'
import { SystemUserService } from '@web-system-service/modules/system/system-user.service'
import * as field from '@web-system-service/interface/instance.resolver'

@ApiTags('系统用户模块')
@Controller('user')
export class SystemUserController {
    constructor(private readonly systemUserService: SystemUserService) {}

    @Post('/create')
    @ApiDecorator({
        operation: { summary: '新增用户账号' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseCreateSystemUser(@Request() request: OmixRequest, @Body() body: field.BaseCreateSystemUser) {
        return await this.systemUserService.httpBaseCreateSystemUser(request, body)
    }

    @Post('/token/authorize')
    @ApiDecorator({
        operation: { summary: '账号登录' },
        response: { status: 200, description: 'OK' },
        authorize: { platform: 'manager' }
    })
    public async httpBaseCreateSystemUserAuthorize(@Request() request: OmixRequest, @Body() body: field.BaseCreateSystemUserAuthorize) {
        return await this.systemUserService.httpBaseCreateSystemUserAuthorize(request, body)
    }

    @Post('/update/switch')
    @ApiDecorator({
        operation: { summary: '编辑账号状态' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseUpdateSwitchSystemUser(@Request() request: OmixRequest, @Body() body: field.BaseSwitchSystemUser) {
        return await this.systemUserService.httpBaseUpdateSwitchSystemUser(request, body)
    }

    @Get('/token/resolver')
    @ApiDecorator({
        operation: { summary: '获取账号基本信息' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseSystemUserResolver(@Request() request: OmixRequest) {
        return await this.systemUserService.httpBaseSystemUserResolver(request)
    }
}
