import { Post, Body, Request } from '@nestjs/common'
import { DeployRoleService } from '@web-windows-server/modules/deploy/role/role.service'
import { ApifoxController, ApiServiceDecorator } from '@/decorator'
import { OmixRequest } from '@/interface'
import * as windows from '@web-windows-server/interface'

@ApifoxController('角色管理', 'deploy/role')
export class DeployRoleController {
    constructor(private readonly deployRoleService: DeployRoleService) {}

    @ApiServiceDecorator(Post('/create'), {
        windows: true,
        operation: { summary: '新增岗位角色' },
        response: { status: 200, description: 'OK', type: windows.OmixPayloadResponse }
    })
    public async httpBaseSystemCreateRole(@Request() request: OmixRequest, @Body() body: windows.CreateRoleOptions) {
        return await this.deployRoleService.httpBaseSystemCreateRole(request, body)
    }

    @ApiServiceDecorator(Post('/update'), {
        windows: true,
        operation: { summary: '编辑岗位角色' },
        response: { status: 200, description: 'OK', type: windows.OmixPayloadResponse }
    })
    public async httpBaseSystemUpdateRole(@Request() request: OmixRequest, @Body() body: windows.UpdateRoleOptions) {
        return await this.deployRoleService.httpBaseSystemUpdateRole(request, body)
    }

    @ApiServiceDecorator(Post('/column'), {
        windows: true,
        operation: { summary: '角色列表查询' },
        response: { status: 200, description: 'OK', type: windows.ColumnRoleOptionsResponse }
    })
    public async httpBaseSystemColumnRole(@Request() request: OmixRequest) {
        return await this.deployRoleService.httpBaseSystemColumnRole(request)
    }

    @ApiServiceDecorator(Post('/resolver'), {
        windows: true,
        operation: { summary: '角色详情' },
        response: { status: 200, description: 'OK', type: windows.RolePayloadOptionsResponse }
    })
    public async httpBaseSystemRoleResolver(@Request() request: OmixRequest, @Body() body: windows.RolePayloadOptions) {
        return await this.deployRoleService.httpBaseSystemRoleResolver(request, body)
    }

    @ApiServiceDecorator(Post('/account/column'), {
        windows: true,
        operation: { summary: '角色关联账号列表' },
        response: { status: 200, description: 'OK', type: windows.ColumnAccountRoleOptionsResponse }
    })
    public async httpBaseSystemColumnAccountRole(@Request() request: OmixRequest, @Body() body: windows.ColumnAccountRoleOptions) {
        return await this.deployRoleService.httpBaseSystemColumnAccountRole(request, body)
    }

    @ApiServiceDecorator(Post('/account/create'), {
        windows: true,
        operation: { summary: '角色关联用户' },
        response: { status: 200, description: 'OK', type: windows.OmixPayloadResponse }
    })
    public async httpBaseSystemCreateAccountRole(@Request() request: OmixRequest, @Body() body: windows.CreateAccountRoleOptions) {
        return await this.deployRoleService.httpBaseSystemCreateAccountRole(request, body)
    }

    @ApiServiceDecorator(Post('/account/delete'), {
        windows: true,
        operation: { summary: '删除角色关联用户' },
        response: { status: 200, description: 'OK', type: windows.OmixPayloadResponse }
    })
    public async httpBaseSystemDeleteAccountRole(@Request() request: OmixRequest, @Body() body: windows.DeleteAccountRoleOptions) {
        return await this.deployRoleService.httpBaseSystemDeleteAccountRole(request, body)
    }

    @ApiServiceDecorator(Post('/sheet/column'), {
        windows: true,
        operation: { summary: '角色菜单权限列表' },
        response: { status: 200, description: 'OK', type: windows.ColumnRoleSheetOptionsResponse }
    })
    public async httpBaseSystemColumnRoleSheet(@Request() request: OmixRequest, @Body() body: windows.ColumnRoleSheetOptions) {
        return await this.deployRoleService.httpBaseSystemColumnRoleSheet(request, body)
    }

    @ApiServiceDecorator(Post('/sheet/update'), {
        windows: true,
        operation: { summary: '更新角色菜单权限' },
        response: { status: 200, description: 'OK', type: windows.OmixPayloadResponse }
    })
    public async httpBaseSystemUpdateRoleSheet(@Request() request: OmixRequest, @Body() body: windows.UpdateRoleSheetOptions) {
        return await this.deployRoleService.httpBaseSystemUpdateRoleSheet(request, body)
    }

    @ApiServiceDecorator(Post('/model/update'), {
        windows: true,
        operation: { summary: '更新角色数据权限' },
        response: { status: 200, description: 'OK', type: windows.OmixPayloadResponse }
    })
    public async httpBaseSystemUpdateRoleModel(@Request() request: OmixRequest, @Body() body: windows.UpdateRoleModelOptions) {
        return await this.deployRoleService.httpBaseSystemUpdateRoleModel(request, body)
    }

    @ApiServiceDecorator(Post('/delete'), {
        windows: true,
        operation: { summary: '删除岗位角色' },
        response: { status: 200, description: 'OK', type: windows.OmixPayloadResponse }
    })
    public async httpBaseSystemDeleteRole(@Request() request: OmixRequest, @Body() body: windows.DeleteRoleOptions) {
        return await this.deployRoleService.httpBaseSystemDeleteRole(request, body)
    }
    @ApiServiceDecorator(Post('/sort/update'), {
        windows: true,
        operation: { summary: '批量更新角色排序' },
        response: { status: 200, description: 'OK', type: windows.OmixPayloadResponse }
    })
    public async httpBaseSystemUpdateRoleSort(@Request() request: OmixRequest, @Body() body: windows.UpdateRoleSortOptions) {
        return await this.deployRoleService.httpBaseSystemUpdateRoleSort(request, body)
    }
}
