import { Controller, Post, Body, Request } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ApiDecorator } from '@/decorator/request.decorator'
import { OmixRequest } from '@/interface/instance.resolver'
import { SystemChunkService } from '@web-system-service/modules/system/system-chunk.service'
import * as field from '@web-system-service/interface/instance.resolver'

@ApiTags('字典模块')
@Controller('chunk')
export class SystemChunkController {
    constructor(private readonly systemChunkService: SystemChunkService) {}

    @Post('/create')
    @ApiDecorator({
        operation: { summary: '新增字典' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseSystemChunkCreate(@Request() request: OmixRequest, @Body() body: field.BaseSystemChunkCreate) {
        return await this.systemChunkService.httpBaseSystemChunkCreate(request, body)
    }

    @Post('/column')
    @ApiDecorator({
        operation: { summary: '字典列表' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseSystemColumnChunk(@Request() request: OmixRequest, @Body() body: field.BaseSystemColumnChunk) {
        return this.systemChunkService.httpBaseSystemColumnChunk(request, body)
    }

    @Post('/update')
    @ApiDecorator({
        operation: { summary: '编辑字典' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseSystemUpdateChunk(@Request() request: OmixRequest, @Body() body: field.BaseSystemUpdateChunk) {
        return await this.systemChunkService.httpBaseSystemUpdateChunk(request, body)
    }

    @Post('/update/state')
    @ApiDecorator({
        operation: { summary: '编辑字典状态' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseSystemSwitchChunk(@Request() request: OmixRequest, @Body() body: field.BaseSystemSwitchChunk) {
        return await this.systemChunkService.httpBaseSystemSwitchChunk(request, body)
    }
}
