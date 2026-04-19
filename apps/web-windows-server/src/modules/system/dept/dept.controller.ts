import { Post, Body, Request } from '@nestjs/common'
import { DeployDeptService } from '@web-windows-server/modules/system/dept/dept.service'
import { ApifoxController, ApiServiceDecorator } from '@/decorator'
import { OmixRequest } from '@/interface'
import * as windows from '@web-windows-server/interface'

@ApifoxController('部门组织', 'system/dept')
export class DeployDeptController {
    constructor(private readonly deptService: DeployDeptService) {}

    @ApiServiceDecorator(Post('create'), {
        windows: true,
        operation: { summary: '新增部门' },
        response: { status: 200, description: 'OK', type: windows.OmixPayloadResponse }
    })
    public async httpBaseSystemCreateDepartment(@Request() request: OmixRequest, @Body() body: windows.CreateDeptOptions) {
        return await this.deptService.httpBaseSystemCreateDepartment(request, body)
    }

    @ApiServiceDecorator(Post('update'), {
        windows: true,
        operation: { summary: '编辑部门' },
        response: { status: 200, description: 'OK', type: windows.OmixPayloadResponse }
    })
    public async httpBaseSystemUpdateDepartment(@Request() request: OmixRequest, @Body() body: windows.UpdateDeptOptions) {
        return await this.deptService.httpBaseSystemUpdateDepartment(request, body)
    }

    @ApiServiceDecorator(Post('resolver'), {
        windows: true,
        operation: { summary: '部门详情' },
        response: { status: 200, description: 'OK', type: windows.DeptPayloadOptionsResponse }
    })
    public async httpBaseSystemDepartmentResolver(@Request() request: OmixRequest, @Body() body: windows.DeptPayloadOptions) {
        return await this.deptService.httpBaseSystemDepartmentResolver(request, body)
    }

    @ApiServiceDecorator(Post('tree/structure'), {
        windows: true,
        operation: { summary: '部门树结构' },
        response: { status: 200, description: 'OK', type: windows.ColumnDeptOptionsResponse }
    })
    public async httpBaseSystemDepartmentTreeStructure(@Request() request: OmixRequest) {
        return await this.deptService.httpBaseSystemDepartmentTreeStructure(request)
    }

    @ApiServiceDecorator(Post('member/options'), {
        windows: true,
        operation: { summary: '部门成员列表' },
        response: { status: 200, description: 'OK', type: windows.OmixPayloadResponse }
    })
    public async httpBaseSystemDeptMemberOptions(@Request() request: OmixRequest, @Body() body: windows.DeptPayloadOptions) {
        return await this.deptService.httpBaseSystemDeptMemberOptions(request, body)
    }

    @ApiServiceDecorator(Post('column'), {
        windows: true,
        operation: { summary: '分页列表查询' },
        response: { status: 200, description: 'OK', type: windows.ColumnDeptOptionsResponse }
    })
    public async httpBaseSystemColumnDepartment(@Request() request: OmixRequest, @Body() body: windows.ColumnDeptOptions) {
        return await this.deptService.httpBaseSystemColumnDepartment(request, body)
    }

    @ApiServiceDecorator(Post('delete'), {
        windows: true,
        operation: { summary: '删除部门' },
        response: { status: 200, description: 'OK', type: windows.OmixPayloadResponse }
    })
    public async httpBaseSystemDeleteDepartment(@Request() request: OmixRequest, @Body() body: windows.DeleteDeptOptions) {
        return await this.deptService.httpBaseSystemDeleteDepartment(request, body)
    }

    @ApiServiceDecorator(Post('member/update'), {
        windows: true,
        operation: { summary: '设置部门成员角色' },
        response: { status: 200, description: 'OK', type: windows.OmixPayloadResponse }
    })
    public async httpBaseSystemUpdateDeptMember(@Request() request: OmixRequest, @Body() body: windows.UpdateDeptMemberOptions) {
        return await this.deptService.httpBaseSystemUpdateDeptMember(request, body)
    }
}
