import { Post, Body, Request } from '@nestjs/common'
import { ResourceService } from '@web-windows-server/modules/system/resource/resource.service'
import { ApifoxController, ApiServiceDecorator } from '@/decorator'
import { OmixRequest } from '@/interface'
import * as windows from '@web-windows-server/interface'

@ApifoxController('资源模块', 'system')
export class ResourceController {
    constructor(private readonly resourceService: ResourceService) {}

    @ApiServiceDecorator(Post('resource/create'), {
        windows: true,
        operation: { summary: '添加菜单资源' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseSystemCreateResource(@Request() request: OmixRequest, @Body() body: windows.CreateResourceOptions) {
        return await this.resourceService.httpBaseSystemCreateResource(request, body)
    }

    @ApiServiceDecorator(Post('resource/update'), {
        windows: true,
        operation: { summary: '编辑菜单资源' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseSystemUpdateResource(@Request() request: OmixRequest, @Body() body: windows.UpdateResourceOptions) {
        return await this.resourceService.httpBaseSystemUpdateResource(request, body)
    }

    @ApiServiceDecorator(Post('resource/resolver'), {
        windows: true,
        operation: { summary: '菜单资源详情' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseSystemResourceResolver(@Request() request: OmixRequest, @Body() body: windows.ResourceResolverOptions) {
        return await this.resourceService.httpBaseSystemResourceResolver(request, body)
    }

    @ApiServiceDecorator(Post('resource/select'), {
        windows: true,
        operation: { summary: '菜单资源树结构表' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseSystemSelectResource(@Request() request: OmixRequest) {
        return await this.resourceService.httpBaseSystemSelectResource(request)
    }

    @ApiServiceDecorator(Post('resource/column'), {
        windows: true,
        operation: { summary: '菜单资源列表' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseSystemColumnResource(@Request() request: OmixRequest, @Body() body: windows.ColumnResourceOptions) {
        return await this.resourceService.httpBaseSystemColumnResource(request, body)
    }

    @ApiServiceDecorator(Post('resource/switch'), {
        windows: true,
        operation: { summary: '菜单资源状态变更' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseSystemSwitchResource(@Request() request: OmixRequest, @Body() body: windows.SwitchResourceOptions) {
        return await this.resourceService.httpBaseSystemSwitchResource(request, body)
    }

    @ApiServiceDecorator(Post('resource/delete'), {
        windows: true,
        operation: { summary: '删除菜单资源' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseSystemDeleteResource(@Request() request: OmixRequest, @Body() body: windows.DeleteResourceOptions) {
        return await this.resourceService.httpBaseSystemDeleteResource(request, body)
    }

    // @ApiServiceDecorator(Post('/sheet/create'), {
    //     windows: true,
    //     operation: { summary: '添加操作按钮' },
    //     response: { status: 200, description: 'OK' }
    // })
    // public async httpBaseSystemCreateSheet(@Request() request: OmixRequest, @Body() body: windows.CreateSheetOptions) {
    //     return await this.sheetService.httpBaseSystemCreateSheet(request, body)
    // }

    // @ApiServiceDecorator(Post('/sheet/update'), {
    //     windows: true,
    //     operation: { summary: '编辑操作按钮' },
    //     response: { status: 200, description: 'OK' }
    // })
    // public async httpBaseSystemUpdateSheet(@Request() request: OmixRequest, @Body() body: windows.UpdateSheetOptions) {
    //     return await this.sheetService.httpBaseSystemUpdateSheet(request, body)
    // }

    // @ApiServiceDecorator(Post('/sheet/resolver'), {
    //     windows: true,
    //     operation: { summary: '操作按钮详情' },
    //     response: { status: 200, description: 'OK' }
    // })
    // public async httpBaseSystemResolverSheet(@Request() request: OmixRequest, @Body() body: windows.ResolverSheetOptions) {
    //     return await this.sheetService.httpBaseSystemResolverSheet(request, body)
    // }

    // @ApiServiceDecorator(Post('/sheet/column'), {
    //     windows: true,
    //     operation: { summary: '操作按钮列表' },
    //     response: { status: 200, description: 'OK' }
    // })
    // public async httpBaseSystemColumnSheet(@Request() request: OmixRequest, @Body() body: windows.ColumnSheetOptions) {
    //     return await this.sheetService.httpBaseSystemColumnSheet(request, body)
    // }

    // @ApiServiceDecorator(Post('/sheet/switch'), {
    //     windows: true,
    //     operation: { summary: '操作按钮状态变更' },
    //     response: { status: 200, description: 'OK' }
    // })
    // public async httpBaseSystemSwitchSheet(@Request() request: OmixRequest, @Body() body: windows.SwitchSheetOptions) {
    //     return await this.sheetService.httpBaseSystemSwitchSheet(request, body)
    // }

    // @ApiServiceDecorator(Post('/sheet/delete'), {
    //     windows: true,
    //     operation: { summary: '删除操作按钮' },
    //     response: { status: 200, description: 'OK' }
    // })
    // public async httpBaseSystemDeleteSheet(@Request() request: OmixRequest, @Body() body: windows.DeleteSheetOptions) {
    //     return await this.sheetService.httpBaseSystemDeleteSheet(request, body)
    // }
}
