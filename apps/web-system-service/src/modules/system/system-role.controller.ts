import { Controller, Post, Get, Body, Query, Request } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ApiDecorator } from '@/decorator/request.decorator'
import { OmixRequest } from '@/interface/instance.resolver'
import { SystemRoleService } from '@web-system-service/modules/system/system-role.service'
import * as field from '@web-system-service/interface/instance.resolver'

@ApiTags('角色模块')
@Controller('role')
export class SystemRoleController {
    constructor(private readonly systemRoleService: SystemRoleService) {}

    @Post('/create')
    @ApiDecorator({
        operation: { summary: '新增角色' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseSystemRoleCreate(@Request() request: OmixRequest, @Body() body: field.BaseSystemRoleCreate) {
        return await this.systemRoleService.httpBaseSystemRoleCreate(request, body)
    }

    @Post('/update')
    @ApiDecorator({
        operation: { summary: '编辑角色' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseSystemRoleUpdate(@Request() request: OmixRequest, @Body() body: field.BaseSystemRoleUpdate) {
        return await this.systemRoleService.httpBaseSystemRoleUpdate(request, body)
    }

    @Post('/update/state')
    @ApiDecorator({
        operation: { summary: '编辑角色状态' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseSystemSwitchRole(@Request() request: OmixRequest, @Body() body: field.BaseSystemSwitchRole) {
        return await this.systemRoleService.httpBaseSystemSwitchRole(request, body)
    }

    @Post('/update/rules')
    @ApiDecorator({
        operation: { summary: '编辑角色权限规则' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseSystemUpdateRoleRules(@Request() request: OmixRequest, @Body() body: field.BaseSystemUpdateRoleRules) {
        return await this.systemRoleService.httpBaseSystemUpdateRoleRules(request, body)
    }

    @Post('/update/user')
    @ApiDecorator({
        operation: { summary: '编辑角色用户' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseSystemUpdateRoleUser(@Request() request: OmixRequest, @Body() body: field.BaseSystemUpdateRoleUser) {
        return await this.systemRoleService.httpBaseSystemUpdateRoleUser(request, body)
    }

    @Post('/column')
    @ApiDecorator({
        operation: { summary: '角色列表' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseSystemColumnRole(@Request() request: OmixRequest, @Body() body: field.BaseSystemColumnRole) {
        return this.systemRoleService.httpBaseSystemColumnRole(request, body)
    }
}
