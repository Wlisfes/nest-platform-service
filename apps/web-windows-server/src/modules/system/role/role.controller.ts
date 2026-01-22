import { Post, Body, Request } from '@nestjs/common'
import { RoleService } from '@web-windows-server/modules/system/role/role.service'
import { ApifoxController, ApiServiceDecorator } from '@/decorator'
import { OmixRequest } from '@/interface'
import * as windows from '@web-windows-server/interface'

@ApifoxController('角色模块', 'system/role')
export class RoleController {
    constructor(private readonly roleService: RoleService) {}

    @ApiServiceDecorator(Post('/create'), {
        windows: true,
        operation: { summary: '新增角色' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseSystemCreateRole(@Request() request: OmixRequest, @Body() body: windows.CreateRoleOptions) {
        return await this.roleService.httpBaseSystemCreateRole(request, body)
    }

    @ApiServiceDecorator(Post('/update'), {
        windows: true,
        operation: { summary: '编辑角色' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseSystemUpdateRole(@Request() request: OmixRequest, @Body() body: windows.UpdateRoleOptions) {
        return await this.roleService.httpBaseSystemUpdateRole(request, body)
    }

    @ApiServiceDecorator(Post('/resolver'), {
        windows: true,
        operation: { summary: '角色详情' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseSystemResolverRole(@Request() request: OmixRequest, @Body() body: windows.RoleResolverOptions) {
        return await this.roleService.httpBaseSystemResolverRole(request, body)
    }

    @ApiServiceDecorator(Post('/column'), {
        windows: true,
        operation: { summary: '角色列表' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseSystemColumnRole(@Request() request: OmixRequest, @Body() body: windows.ColumnRoleOptions) {
        return await this.roleService.httpBaseSystemColumnRole(request, body)
    }

    @ApiServiceDecorator(Post('/delete'), {
        windows: true,
        operation: { summary: '删除角色' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseSystemDeleteRole(@Request() request: OmixRequest, @Body() body: windows.DeleteRoleOptions) {
        return await this.roleService.httpBaseSystemDeleteRole(request, body)
    }

    @ApiServiceDecorator(Post('/grant'), {
        windows: true,
        operation: { summary: '角色授权' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseSystemGrantRole(@Request() request: OmixRequest, @Body() body: windows.GrantRoleOptions) {
        return await this.roleService.httpBaseSystemGrantRole(request, body)
    }

    @ApiServiceDecorator(Post('/permissions'), {
        windows: true,
        operation: { summary: '查询角色已授权权限' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseSystemRolePermissions(@Request() request: OmixRequest, @Body() body: windows.RolePermissionsOptions) {
        return await this.roleService.httpBaseSystemRolePermissions(request, body)
    }
}
