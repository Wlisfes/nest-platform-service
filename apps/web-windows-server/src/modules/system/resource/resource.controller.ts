import { Post, Body, Request } from '@nestjs/common'
import { ResourceService } from '@web-windows-server/modules/system/resource/resource.service'
import { ApifoxController, ApiServiceDecorator } from '@/decorator'
import { OmixRequest } from '@/interface'
import * as windows from '@web-windows-server/interface'

@ApifoxController('资源模块', 'system/resource')
export class ResourceController {
    constructor(private readonly resourceService: ResourceService) {}

    @ApiServiceDecorator(Post('/create'), {
        operation: { summary: '新增菜单资源' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseSystemCreateResource(@Request() request: OmixRequest, @Body() body: windows.CreateResourceOptions) {
        return await this.resourceService.httpBaseSystemCreateResource(request, body)
    }

    @ApiServiceDecorator(Post('/update'), {
        operation: { summary: '编辑菜单资源' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseSystemUpdateResource(@Request() request: OmixRequest, @Body() body: windows.UpdateResourceOptions) {}

    @ApiServiceDecorator(Post('/column'), {
        operation: { summary: '菜单资源列表' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseSystemColumnResource(@Request() request: OmixRequest, @Body() body: windows.ColumnResourceOptions) {}

    @ApiServiceDecorator(Post('/switch'), {
        operation: { summary: '菜单资源状态变更' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseSystemSwitchResource(@Request() request: OmixRequest, @Body() body: windows.SwitchResourceOptions) {}

    @ApiServiceDecorator(Post('/delete'), {
        operation: { summary: '删除菜单资源' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseSystemDeleteResource(@Request() request: OmixRequest, @Body() body: windows.DeleteResourceOptions) {}
}
