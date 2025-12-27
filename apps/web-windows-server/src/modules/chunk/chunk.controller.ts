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
}
