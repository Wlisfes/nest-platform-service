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

    @Post('/model/update')
    @ApiDecorator({
        operation: { summary: '编辑角色数据权限' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseSystemRoleUpdateModel(@Request() request: OmixRequest, @Body() body: field.BaseSystemRoleModelUpdate) {
        return await this.systemRoleService.httpBaseSystemRoleModelUpdate(request, body)
    }

    @Post('/delete')
    @ApiDecorator({
        operation: { summary: '删除角色' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseSystemRoleDelete(@Request() request: OmixRequest, @Body() body: field.BaseSystemRoleResolver) {
        return await this.systemRoleService.httpBaseSystemRoleDelete(request, body)
    }

    @Post('/resolver')
    @ApiDecorator({
        operation: { summary: '角色详情信息' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseSystemRoleResolver(@Request() request: OmixRequest, @Body() body: field.BaseSystemRoleResolver) {
        return await this.systemRoleService.httpBaseSystemRoleResolver(request, body)
    }

    @Post('/column/whole')
    @ApiDecorator({
        operation: { summary: '所有角色配置' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseSystemColumnRoleWhole(@Request() request: OmixRequest) {
        return this.systemRoleService.httpBaseSystemColumnRoleWhole(request)
    }

    @Post('/column/user')
    @ApiDecorator({
        operation: { summary: '角色关联用户列表' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseSystemColumnRoleUser(@Request() request: OmixRequest, @Body() body: field.BaseSystemColumnRoleUser) {
        return await this.systemRoleService.httpBaseSystemColumnRoleUser(request, body)
    }

    @Post('/join/user')
    @ApiDecorator({
        operation: { summary: '角色关联用户' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseSystemJoinRoleUser(@Request() request: OmixRequest, @Body() body: field.BaseSystemJoinRoleUser) {
        return await this.systemRoleService.httpBaseSystemJoinRoleUser(request, body)
    }

    @Post('/join/user/delete')
    @ApiDecorator({
        operation: { summary: '移除角色关联用户' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseSystemJoinRoleUserDelete(@Request() request: OmixRequest, @Body() body: field.BaseSystemJoinRoleUser) {
        return await this.systemRoleService.httpBaseSystemJoinRoleUserDelete(request, body)
    }

    @Post('/join/router')
    @ApiDecorator({
        operation: { summary: '角色关联菜单' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseSystemJoinRoleRouter(@Request() request: OmixRequest, @Body() body: field.BaseSystemJoinRoleRouter) {
        return await this.systemRoleService.httpBaseSystemJoinRoleRouter(request, body)
    }
}
