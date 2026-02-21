import { Post, Body, Request } from '@nestjs/common'
import { RoleService } from '@web-windows-server/modules/system/role/role.service'
import { ApifoxController, ApiServiceDecorator } from '@/decorator'
import { OmixRequest } from '@/interface'
import * as windows from '@web-windows-server/interface'

@ApifoxController('角色管理', 'system/role')
export class RoleController {
    constructor(private readonly roleService: RoleService) {}

    @ApiServiceDecorator(Post('create/common'), {
        windows: true,
        operation: { summary: '添加岗位角色' },
        response: { status: 200, description: 'OK', type: windows.OmixPayloadResponse }
    })
    public async httpBaseSystemCreateCommonRole(@Request() request: OmixRequest, @Body() body: windows.CreateCommonRoleOptions) {
        return await this.roleService.httpBaseSystemCreateCommonRole(request, body)
    }

    @ApiServiceDecorator(Post('update/common'), {
        windows: true,
        operation: { summary: '编辑岗位角色' },
        response: { status: 200, description: 'OK', type: windows.OmixPayloadResponse }
    })
    public async httpBaseSystemUpdateCommonRole(@Request() request: OmixRequest, @Body() body: windows.UpdateCommonRoleOptions) {
        return await this.roleService.httpBaseSystemUpdateCommonRole(request, body)
    }

    @ApiServiceDecorator(Post('resolver'), {
        windows: true,
        operation: { summary: '角色详情' },
        response: { status: 200, description: 'OK', type: windows.RolePayloadOptionsResponse }
    })
    public async httpBaseSystemRoleResolver(@Request() request: OmixRequest, @Body() body: windows.RolePayloadOptions) {
        return await this.roleService.httpBaseSystemRoleResolver(request, body)
    }

    @ApiServiceDecorator(Post('column'), {
        windows: true,
        operation: { summary: '角色列表查询' },
        response: { status: 200, description: 'OK', type: windows.ColumnRoleOptionsResponse }
    })
    public async httpBaseSystemColumnRole(@Request() request: OmixRequest) {
        return await this.roleService.httpBaseSystemColumnRole(request)
    }

    @ApiServiceDecorator(Post('account/column'), {
        windows: true,
        operation: { summary: '角色关联账号列表' },
        response: { status: 200, description: 'OK', type: windows.ColumnRoleAccountOptionsResponse }
    })
    public async httpBaseSystemColumnRoleAccount(@Request() request: OmixRequest, @Body() body: windows.ColumnRoleAccountOptions) {
        return await this.roleService.httpBaseSystemColumnRoleAccount(request, body)
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
