import { Post, Body, Request } from '@nestjs/common'
import { DeptService } from '@web-windows-server/modules/system/dept/dept.service'
import { ApifoxController, ApiServiceDecorator } from '@/decorator'
import { OmixRequest } from '@/interface'
import * as windows from '@web-windows-server/interface'

@ApifoxController('部门组织模块', 'system/dept')
export class DeptController {
    constructor(private readonly deptService: DeptService) {}

    @ApiServiceDecorator(Post('/create'), {
        windows: true,
        operation: { summary: '新增部门' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseSystemCreateDept(@Request() request: OmixRequest, @Body() body: windows.CreateDeptOptions) {
        return await this.deptService.httpBaseSystemCreateDept(request, body)
    }

    @ApiServiceDecorator(Post('/update'), {
        windows: true,
        operation: { summary: '编辑部门' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseSystemUpdateDept(@Request() request: OmixRequest, @Body() body: windows.UpdateDeptOptions) {
        return await this.deptService.httpBaseSystemUpdateDept(request, body)
    }

    @ApiServiceDecorator(Post('/resolver'), {
        windows: true,
        operation: { summary: '部门详情' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseSystemResolverDept(@Request() request: OmixRequest, @Body() body: windows.DeptResolverOptions) {
        return await this.deptService.httpBaseSystemResolverDept(request, body)
    }

    @ApiServiceDecorator(Post('/select'), {
        windows: true,
        operation: { summary: '部门树结构表' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseSystemSelectDept(@Request() request: OmixRequest) {
        return await this.deptService.httpBaseSystemSelectDept(request)
    }

    @ApiServiceDecorator(Post('/column'), {
        windows: true,
        operation: { summary: '部门列表' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseSystemColumnDept(@Request() request: OmixRequest, @Body() body: windows.ColumnDeptOptions) {
        return await this.deptService.httpBaseSystemColumnDept(request, body)
    }

    @ApiServiceDecorator(Post('/delete'), {
        windows: true,
        operation: { summary: '删除部门' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseSystemDeleteDept(@Request() request: OmixRequest, @Body() body: windows.DeleteDeptOptions) {
        return await this.deptService.httpBaseSystemDeleteDept(request, body)
    }
}
