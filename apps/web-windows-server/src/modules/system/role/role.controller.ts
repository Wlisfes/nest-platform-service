import { Post, Body, Request } from '@nestjs/common'
import { RoleService } from '@web-windows-server/modules/system/role/role.service'
import { ApifoxController, ApiServiceDecorator } from '@/decorator'
import { OmixRequest } from '@/interface'
import * as windows from '@web-windows-server/interface'

@ApifoxController('角色管理', 'system/role')
export class RoleController {
    constructor(private readonly roleService: RoleService) {}

    @ApiServiceDecorator(Post('create'), {
        windows: true,
        operation: { summary: '添加岗位角色' },
        response: { status: 200, description: 'OK', type: windows.OmixPayloadResponse }
    })
    public async httpBaseSystemCreateRole(@Request() request: OmixRequest, @Body() body: windows.CreateRoleOptions) {
        return await this.roleService.httpBaseSystemCreateRole(request, body)
    }

    @ApiServiceDecorator(Post('update'), {
        windows: true,
        operation: { summary: '编辑岗位角色' },
        response: { status: 200, description: 'OK', type: windows.OmixPayloadResponse }
    })
    public async httpBaseSystemUpdateRole(@Request() request: OmixRequest, @Body() body: windows.UpdateRoleOptions) {
        return await this.roleService.httpBaseSystemUpdateRole(request, body)
    }

    @ApiServiceDecorator(Post('column'), {
        windows: true,
        operation: { summary: '角色列表查询' },
        response: { status: 200, description: 'OK', type: windows.ColumnRoleOptionsResponse }
    })
    public async httpBaseSystemColumnRole(@Request() request: OmixRequest) {
        return await this.roleService.httpBaseSystemColumnRole(request)
    }

    @ApiServiceDecorator(Post('resolver'), {
        windows: true,
        operation: { summary: '角色详情' },
        response: { status: 200, description: 'OK', type: windows.RolePayloadOptionsResponse }
    })
    public async httpBaseSystemRoleResolver(@Request() request: OmixRequest, @Body() body: windows.RolePayloadOptions) {
        return await this.roleService.httpBaseSystemRoleResolver(request, body)
    }

    @ApiServiceDecorator(Post('account/column'), {
        windows: true,
        operation: { summary: '角色关联账号列表' },
        response: { status: 200, description: 'OK', type: windows.ColumnAccountRoleOptionsResponse }
    })
    public async httpBaseSystemColumnAccountRole(@Request() request: OmixRequest, @Body() body: windows.ColumnAccountRoleOptions) {
        return await this.roleService.httpBaseSystemColumnAccountRole(request, body)
    }

    @ApiServiceDecorator(Post('account/create'), {
        windows: true,
        operation: { summary: '角色关联用户' },
        response: { status: 200, description: 'OK', type: windows.OmixPayloadResponse }
    })
    public async httpBaseSystemCreateAccountRole(@Request() request: OmixRequest, @Body() body: windows.CreateAccountRoleOptions) {
        return await this.roleService.httpBaseSystemCreateAccountRole(request, body)
    }

    @ApiServiceDecorator(Post('account/delete'), {
        windows: true,
        operation: { summary: '删除角色关联用户' },
        response: { status: 200, description: 'OK', type: windows.OmixPayloadResponse }
    })
    public async httpBaseSystemDeleteAccountRole(@Request() request: OmixRequest, @Body() body: windows.DeleteAccountRoleOptions) {
        return await this.roleService.httpBaseSystemDeleteAccountRole(request, body)
    }

    @ApiServiceDecorator(Post('sheet/column'), {
        windows: true,
        operation: { summary: '角色菜单权限列表' },
        response: { status: 200, description: 'OK', type: windows.ColumnRoleSheetOptionsResponse }
    })
    public async httpBaseSystemColumnRoleSheet(@Request() request: OmixRequest, @Body() body: windows.ColumnRoleSheetOptions) {
        return await this.roleService.httpBaseSystemColumnRoleSheet(request, body)
    }
}
