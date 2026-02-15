import { Post, Body, Request } from '@nestjs/common'
import { ApifoxController, ApiServiceDecorator } from '@/decorator'
import { OmixRequest } from '@/interface'
import { ChunkService } from '@web-windows-server/modules/chunk/chunk.service'
import * as windows from '@web-windows-server/interface'

@ApifoxController('字典模块', '/chunk')
export class ChunkController {
    constructor(private readonly chunkService: ChunkService) {}

    @ApiServiceDecorator(Post('/enums/select'), {
        operation: { summary: '通用下拉字典' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseChunkSelect(@Request() request: OmixRequest, @Body() body: windows.ChunkSelectOptions) {
        return await this.chunkService.httpBaseChunkSelect(request, body)
    }

    @ApiServiceDecorator(Post('/update/search'), {
        windows: true,
        operation: { summary: '更新搜索栏字段配置' },
        response: { status: 200, description: 'OK', type: windows.OmixPayloadResponse }
    })
    public async httpBaseUpdateChunkSearch(@Request() request: OmixRequest, @Body() body: windows.UpdateChunkOptions) {
        return await this.chunkService.httpBaseUpdateChunkSearch(request, body)
    }

    @ApiServiceDecorator(Post('/update/columns'), {
        windows: true,
        operation: { summary: '更新表头字段配置' },
        response: { status: 200, description: 'OK', type: windows.OmixPayloadResponse }
    })
    public async httpBaseUpdateChunkColumns(@Request() request: OmixRequest, @Body() body: windows.UpdateChunkOptions) {
        return await this.chunkService.httpBaseUpdateChunkColumns(request, body)
    }

    @ApiServiceDecorator(Post('/field/customize'), {
        windows: true,
        operation: { summary: '查询字段配置' },
        response: { status: 200, description: 'OK', type: windows.ColumnChunkOptionsResponse }
    })
    public async httpBaseColumnChunkCustomize(@Request() request: OmixRequest, @Body() body: windows.ColumnChunkOptions) {
        return await this.chunkService.httpBaseColumnChunkCustomize(request, body)
    }
}
