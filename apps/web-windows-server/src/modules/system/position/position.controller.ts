import { Post, Body, Request } from '@nestjs/common'
import { PositionService } from '@web-windows-server/modules/system/position/position.service'
import { ApifoxController, ApiServiceDecorator } from '@/decorator'
import { OmixRequest } from '@/interface'
import * as windows from '@web-windows-server/interface'

@ApifoxController('职位管理', 'system/position')
export class PositionController {
    constructor(private readonly positionService: PositionService) {}

    @ApiServiceDecorator(Post('create'), {
        windows: true,
        operation: { summary: '新增职位' },
        response: { status: 200, description: 'OK', type: windows.OmixPayloadResponse }
    })
    public async httpBaseSystemCreatePosition(@Request() request: OmixRequest, @Body() body: windows.CreatePositionOptions) {
        return await this.positionService.httpBaseSystemCreatePosition(request, body)
    }

    @ApiServiceDecorator(Post('update'), {
        windows: true,
        operation: { summary: '编辑职位' },
        response: { status: 200, description: 'OK', type: windows.OmixPayloadResponse }
    })
    public async httpBaseSystemUpdatePosition(@Request() request: OmixRequest, @Body() body: windows.UpdatePositionOptions) {
        return await this.positionService.httpBaseSystemUpdatePosition(request, body)
    }

    @ApiServiceDecorator(Post('resolver'), {
        windows: true,
        operation: { summary: '职位详情' },
        response: { status: 200, description: 'OK', type: windows.PositionPayloadOptionsResponse }
    })
    public async httpBaseSystemPositionResolver(@Request() request: OmixRequest, @Body() body: windows.PositionPayloadOptions) {
        return await this.positionService.httpBaseSystemPositionResolver(request, body)
    }

    @ApiServiceDecorator(Post('column'), {
        windows: true,
        operation: { summary: '分页列表查询' },
        response: { status: 200, description: 'OK', type: windows.ColumnPositionOptionsResponse }
    })
    public async httpBaseSystemColumnPosition(@Request() request: OmixRequest, @Body() body: windows.ColumnPositionOptions) {
        return await this.positionService.httpBaseSystemColumnPosition(request, body)
    }

    @ApiServiceDecorator(Post('delete'), {
        windows: true,
        operation: { summary: '删除职位' },
        response: { status: 200, description: 'OK', type: windows.OmixPayloadResponse }
    })
    public async httpBaseSystemDeletePosition(@Request() request: OmixRequest, @Body() body: windows.DeletePositionOptions) {
        return await this.positionService.httpBaseSystemDeletePosition(request, body)
    }
}
