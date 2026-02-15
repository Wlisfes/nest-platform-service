import { Post, Body, Request } from '@nestjs/common'
import { DeptService } from '@web-windows-server/modules/system/dept/dept.service'
import { ApifoxController, ApiServiceDecorator } from '@/decorator'
import { OmixRequest } from '@/interface'
import * as windows from '@web-windows-server/interface'

@ApifoxController('部门组织', 'system/dept')
export class DeptController {
    constructor(private readonly deptService: DeptService) {}

    @ApiServiceDecorator(Post('create'), {
        windows: true,
        operation: { summary: '添加部门' },
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

    @ApiServiceDecorator(Post('column'), {
        windows: true,
        operation: { summary: '分页列表查询' },
        response: { status: 200, description: 'OK', type: windows.ColumnDeptOptionsResponse }
    })
    public async httpBaseSystemColumnDepartment(@Request() request: OmixRequest, @Body() body: windows.ColumnDeptOptions) {
        return await this.deptService.httpBaseSystemColumnDepartment(request, body)
    }
}
