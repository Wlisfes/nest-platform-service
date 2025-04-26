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
    public async httpBaseSystemUserCreate(@Request() request: OmixRequest, @Body() body: field.BaseSystemUserCreate) {
        return await this.systemUserService.httpBaseSystemUserCreate(request, body)
    }

    @Post('/token/authorize')
    @ApiDecorator({
        operation: { summary: '用户账号登录' },
        response: { status: 200, description: 'OK' },
        authorize: { platform: 'manager' }
    })
    public async httpBaseSystemUserTokenAuthorize(@Request() request: OmixRequest, @Body() body: field.BaseSystemUserTokenAuthorize) {
        return await this.systemUserService.httpBaseSystemUserTokenAuthorize(request, body)
    }

    @Post('/column')
    @ApiDecorator({
        operation: { summary: '用户账号列表' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseSystemColumnUser(@Request() request: OmixRequest, @Body() body: field.BaseSystemColumnUser) {
        return this.systemUserService.httpBaseSystemColumnUser(request, body)
    }

    @Post('/column/chunk')
    @ApiDecorator({
        operation: { summary: '通用用户账号列表' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseSystemColumnChunkUser(@Request() request: OmixRequest) {
        return this.systemUserService.httpBaseSystemColumnChunkUser(request)
    }

    @Post('/update/state')
    @ApiDecorator({
        operation: { summary: '编辑账号状态' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseSystemSwitchUser(@Request() request: OmixRequest, @Body() body: field.BaseSystemSwitchUser) {
        return await this.systemUserService.httpBaseSystemSwitchUser(request, body)
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
