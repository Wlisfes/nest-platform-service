import { Controller, Post, Get, Body, Query, Request } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ApiDecorator } from '@/decorator/request.decorator'
import { OmixRequest } from '@/interface/instance.resolver'
import { SystemRoleService } from '@web-system-service/modules/system/system-role.service'
import * as field from '@web-system-service/interface/instance.resolver'

@ApiTags('角色权限模块')
@Controller('system/role')
export class SystemRoleController {
    constructor(private readonly systemRoleService: SystemRoleService) {}

    @Post('/create')
    @ApiDecorator({
        operation: { summary: '新增角色权限' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseCreateSystemRole(@Request() request: OmixRequest, @Body() body: field.BaseCreateSystemRole) {
        return await this.systemRoleService.httpBaseCreateSystemRole(request, body)
    }

    @Post('/update')
    @ApiDecorator({
        operation: { summary: '编辑角色' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseUpdateSystemRole(@Request() request: OmixRequest, @Body() body: field.BaseUpdateSystemRole) {
        return await this.systemRoleService.httpBaseUpdateSystemRole(request, body)
    }

    @Post('/update/switch')
    @ApiDecorator({
        operation: { summary: '编辑角色状态' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseUpdateSwitchSystemRole(@Request() request: OmixRequest, @Body() body: field.BaseSwitchSystemRole) {
        return await this.systemRoleService.httpBaseUpdateSwitchSystemRole(request, body)
    }

    @Post('/update/router')
    @ApiDecorator({
        operation: { summary: '编辑角色权限' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseUpdateSystemRoleRouter(@Request() request: OmixRequest, @Body() body: field.BaseUpdateSystemRoleRouter) {
        return await this.systemRoleService.httpBaseUpdateSystemRoleRouter(request, body)
    }

    @Post('/update/user')
    @ApiDecorator({
        operation: { summary: '编辑角色用户' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseUpdateSystemRoleUser(@Request() request: OmixRequest, @Body() body: field.BaseUpdateSystemRoleUser) {
        return await this.systemRoleService.httpBaseUpdateSystemRoleUser(request, body)
    }

    @Post('/column')
    @ApiDecorator({
        operation: { summary: '角色权限列表' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseColumnSystemRole(@Request() request: OmixRequest, @Body() body: field.BaseColumnSystemRole) {
        return this.systemRoleService.httpBaseColumnSystemRole(request, body)
    }
}
