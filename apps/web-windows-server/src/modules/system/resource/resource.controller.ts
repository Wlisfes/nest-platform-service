import { Post, Body, Request } from '@nestjs/common'
import { ResourceService } from '@web-windows-server/modules/system/resource/resource.service'
import { ApifoxController, ApiServiceDecorator } from '@/decorator'
import { OmixRequest } from '@/interface'
import * as windows from '@web-windows-server/interface'

@ApifoxController('资源模块', 'system/resource')
export class ResourceController {
    constructor(private readonly resourceService: ResourceService) {}

    @ApiServiceDecorator(Post('/create'), {
        windows: true,
        operation: { summary: '新增菜单资源' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseSystemCreateResource(@Request() request: OmixRequest, @Body() body: windows.CreateResourceOptions) {
        return await this.resourceService.httpBaseSystemCreateResource(request, body)
    }

    @ApiServiceDecorator(Post('/update'), {
        windows: true,
        operation: { summary: '编辑菜单资源' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseSystemUpdateResource(@Request() request: OmixRequest, @Body() body: windows.UpdateResourceOptions) {
        return await this.resourceService.httpBaseSystemUpdateResource(request, body)
    }

    @ApiServiceDecorator(Post('/resolver'), {
        windows: true,
        operation: { summary: '菜单资源详情' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseSystemResourceResolver(@Request() request: OmixRequest, @Body() body: windows.ResourceResolverOptions) {
        return await this.resourceService.httpBaseSystemResourceResolver(request, body)
    }

    @ApiServiceDecorator(Post('/select'), {
        windows: true,
        operation: { summary: '菜单资源树结构表' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseSystemSelectResource(@Request() request: OmixRequest) {
        return await this.resourceService.httpBaseSystemSelectResource(request)
    }

    @ApiServiceDecorator(Post('/column'), {
        windows: true,
        operation: { summary: '菜单资源列表' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseSystemColumnResource(@Request() request: OmixRequest, @Body() body: windows.ColumnResourceOptions) {
        return await this.resourceService.httpBaseSystemColumnResource(request, body)
    }

    @ApiServiceDecorator(Post('/switch'), {
        windows: true,
        operation: { summary: '菜单资源状态变更' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseSystemSwitchResource(@Request() request: OmixRequest, @Body() body: windows.SwitchResourceOptions) {
        return await this.resourceService.httpBaseSystemSwitchResource(request, body)
    }

    @ApiServiceDecorator(Post('/delete'), {
        windows: true,
        operation: { summary: '删除菜单资源' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseSystemDeleteResource(@Request() request: OmixRequest, @Body() body: windows.DeleteResourceOptions) {
        return await this.resourceService.httpBaseSystemDeleteResource(request, body)
    }

    @ApiServiceDecorator(Post('/sheet/create'), {
        windows: true,
        operation: { summary: '新增操作按钮' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseSystemCreateSheet(@Request() request: OmixRequest, @Body() body: windows.CreateSheetOptions) {
        return await this.resourceService.httpBaseSystemCreateSheet(request, body)
    }

    @ApiServiceDecorator(Post('/sheet/update'), {
        windows: true,
        operation: { summary: '编辑操作按钮' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseSystemUpdateSheet(@Request() request: OmixRequest, @Body() body: windows.UpdateSheetOptions) {
        return await this.resourceService.httpBaseSystemUpdateSheet(request, body)
    }

    @ApiServiceDecorator(Post('/sheet/resolver'), {
        windows: true,
        operation: { summary: '操作按钮详情' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseSystemSheetResolver(@Request() request: OmixRequest, @Body() body: windows.SheetResolverOptions) {
        return await this.resourceService.httpBaseSystemSheetResolver(request, body)
    }

    @ApiServiceDecorator(Post('/sheet/column'), {
        windows: true,
        operation: { summary: '操作按钮列表' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseSystemColumnSheet(@Request() request: OmixRequest, @Body() body: windows.ColumnSheetOptions) {
        return await this.resourceService.httpBaseSystemColumnSheet(request, body)
    }

    @ApiServiceDecorator(Post('/sheet/switch'), {
        windows: true,
        operation: { summary: '操作按钮状态变更' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseSystemSwitchSheet(@Request() request: OmixRequest, @Body() body: windows.SwitchSheetOptions) {
        return await this.resourceService.httpBaseSystemSwitchSheet(request, body)
    }

    @ApiServiceDecorator(Post('/sheet/delete'), {
        windows: true,
        operation: { summary: '删除操作按钮' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseSystemDeleteSheet(@Request() request: OmixRequest, @Body() body: windows.DeleteSheetOptions) {
        return await this.resourceService.httpBaseSystemDeleteSheet(request, body)
    }

    @ApiServiceDecorator(Post('/apifox/create'), {
        windows: true,
        operation: { summary: '新增接口权限' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseSystemCreateApifox(@Request() request: OmixRequest, @Body() body: windows.CreateApifoxOptions) {
        return await this.resourceService.httpBaseSystemCreateApifox(request, body)
    }

    @ApiServiceDecorator(Post('/apifox/update'), {
        windows: true,
        operation: { summary: '编辑接口权限' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseSystemUpdateApifox(@Request() request: OmixRequest, @Body() body: windows.UpdateApifoxOptions) {
        return await this.resourceService.httpBaseSystemUpdateApifox(request, body)
    }

    @ApiServiceDecorator(Post('/apifox/resolver'), {
        windows: true,
        operation: { summary: '接口权限详情' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseSystemApifoxResolver(@Request() request: OmixRequest, @Body() body: windows.ApifoxResolverOptions) {
        return await this.resourceService.httpBaseSystemApifoxResolver(request, body)
    }

    @ApiServiceDecorator(Post('/apifox/column'), {
        windows: true,
        operation: { summary: '接口权限列表' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseSystemColumnApifox(@Request() request: OmixRequest, @Body() body: windows.ColumnApifoxOptions) {
        return await this.resourceService.httpBaseSystemColumnApifox(request, body)
    }

    @ApiServiceDecorator(Post('/apifox/switch'), {
        windows: true,
        operation: { summary: '接口权限状态变更' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseSystemSwitchApifox(@Request() request: OmixRequest, @Body() body: windows.SwitchApifoxOptions) {
        return await this.resourceService.httpBaseSystemSwitchApifox(request, body)
    }

    @ApiServiceDecorator(Post('/apifox/delete'), {
        windows: true,
        operation: { summary: '删除接口权限' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseSystemDeleteApifox(@Request() request: OmixRequest, @Body() body: windows.DeleteApifoxOptions) {
        return await this.resourceService.httpBaseSystemDeleteApifox(request, body)
    }
}
