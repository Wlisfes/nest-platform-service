import { Post, Body, Request } from '@nestjs/common'
import { DeploySheetService } from '@web-windows-server/modules/deploy/sheet/sheet.service'
import { ApifoxController, ApiServiceDecorator } from '@/decorator'
import { OmixRequest } from '@/interface'
import * as windows from '@web-windows-server/interface'

@ApifoxController('菜单管理', 'deploy/sheet')
export class DeploySheetController {
    constructor(private readonly deploySheetService: DeploySheetService) {}

    @ApiServiceDecorator(Post('create/resource'), {
        windows: true,
        operation: { summary: '新增菜单' },
        response: { status: 200, description: 'OK', type: windows.OmixPayloadResponse }
    })
    public async httpBaseSystemCreateSheetResource(@Request() request: OmixRequest, @Body() body: windows.CreateSheetOptionsResource) {
        return await this.deploySheetService.httpBaseSystemCreateSheetResource(request, body)
    }

    @ApiServiceDecorator(Post('update/resource'), {
        windows: true,
        operation: { summary: '编辑菜单' },
        response: { status: 200, description: 'OK', type: windows.OmixPayloadResponse }
    })
    public async httpBaseSystemUpdateSheetResource(@Request() request: OmixRequest, @Body() body: windows.UpdateSheetOptionsResource) {
        return await this.deploySheetService.httpBaseSystemUpdateSheetResource(request, body)
    }

    @ApiServiceDecorator(Post('resolver'), {
        windows: true,
        operation: { summary: '菜单、按钮详情' },
        response: { status: 200, description: 'OK', type: windows.SheetPayloadOptionsResponse }
    })
    public async httpBaseSystemSheetResolver(@Request() request: OmixRequest, @Body() body: windows.SheetPayloadOptions) {
        return await this.deploySheetService.httpBaseSystemSheetResolver(request, body)
    }

    @ApiServiceDecorator(Post('tree/structure'), {
        windows: true,
        operation: { summary: '菜单树结构' },
        response: { status: 200, description: 'OK', type: windows.ColumnSheetOptionsResponse }
    })
    public async httpBaseSystemSheetTreeStructure(@Request() request: OmixRequest) {
        return await this.deploySheetService.httpBaseSystemSheetTreeStructure(request)
    }

    @ApiServiceDecorator(Post('column'), {
        windows: true,
        operation: { summary: '分页列表查询' },
        response: { status: 200, description: 'OK', type: windows.ColumnSheetOptionsResponse }
    })
    public async httpBaseSystemColumnSheet(@Request() request: OmixRequest, @Body() body: windows.ColumnSheetOptions) {
        return await this.deploySheetService.httpBaseSystemColumnSheet(request, body)
    }

    @ApiServiceDecorator(Post('/create/authorize'), {
        windows: true,
        operation: { summary: '新增按钮权限' },
        response: { status: 200, description: 'OK', type: windows.OmixPayloadResponse }
    })
    public async httpBaseSystemCreateSheetAuthorize(@Request() request: OmixRequest, @Body() body: windows.CreateSheetOptionsAuthorize) {
        return await this.deploySheetService.httpBaseSystemCreateSheetAuthorize(request, body)
    }

    @ApiServiceDecorator(Post('/update/authorize'), {
        windows: true,
        operation: { summary: '编辑按钮权限' },
        response: { status: 200, description: 'OK', type: windows.OmixPayloadResponse }
    })
    public async httpBaseSystemUpdateSheetAuthorize(@Request() request: OmixRequest, @Body() body: windows.UpdateSheetOptionsAuthorize) {
        return await this.deploySheetService.httpBaseSystemUpdateSheetAuthorize(request, body)
    }

    @ApiServiceDecorator(Post('delete'), {
        windows: true,
        operation: { summary: '删除菜单/按钮' },
        response: { status: 200, description: 'OK', type: windows.OmixPayloadResponse }
    })
    public async httpBaseSystemDeleteSheet(@Request() request: OmixRequest, @Body() body: windows.DeleteSheetOptions) {
        return await this.deploySheetService.httpBaseSystemDeleteSheet(request, body)
    }
}
