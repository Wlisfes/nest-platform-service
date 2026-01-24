import { Post, Body, Request } from '@nestjs/common'
import { SheetService } from '@web-windows-server/modules/system/sheet/sheet.service'
import { ApifoxController, ApiServiceDecorator } from '@/decorator'
import { OmixRequest } from '@/interface'
import * as windows from '@web-windows-server/interface'

@ApifoxController('菜单管理', 'system/sheet')
export class SheetController {
    constructor(private readonly sheetService: SheetService) {}

    @ApiServiceDecorator(Post('create/resource'), {
        windows: true,
        operation: { summary: '添加菜单' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseSystemCreateSheetResource(@Request() request: OmixRequest, @Body() body: windows.CreateSheetResourceOptions) {
        return await this.sheetService.httpBaseSystemCreateSheetResource(request, body)
    }

    @ApiServiceDecorator(Post('update/resource'), {
        windows: true,
        operation: { summary: '编辑菜单' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseSystemUpdateSheetResource(@Request() request: OmixRequest, @Body() body: windows.UpdateSheetResourceOptions) {
        return await this.sheetService.httpBaseSystemUpdateSheetResource(request, body)
    }

    @ApiServiceDecorator(Post('basic/resource'), {
        windows: true,
        operation: { summary: '菜单详情' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseSystemBasicSheetResource(@Request() request: OmixRequest, @Body() body: windows.BasicSheetResourceOptions) {
        return await this.sheetService.httpBaseSystemBasicSheetResource(request, body)
    }

    @ApiServiceDecorator(Post('select/resource'), {
        windows: true,
        operation: { summary: '菜单树结构' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseSystemSelectSheetResource(@Request() request: OmixRequest) {
        // return await this.resourceService.httpBaseSystemSelectResource(request)
    }

    @ApiServiceDecorator(Post('column/resource'), {
        windows: true,
        operation: { summary: '菜单列表' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseSystemColumnSheetResource(@Request() request: OmixRequest, @Body() body: windows.ColumnSheetResourceOptions) {
        return await this.sheetService.httpBaseSystemColumnSheetResource(request, body)
    }
}
