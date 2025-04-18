import { Controller, Post, Get, Body, Query, Request } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ApiDecorator } from '@/decorator/request.decorator'
import { OmixRequest } from '@/interface/instance.resolver'
import { SystemChunkService } from '@web-system-service/modules/system/system-chunk.service'
import * as field from '@web-system-service/interface/instance.resolver'
import * as enums from '@/modules/database/database.enums'

@ApiTags('字典模块')
@Controller('chunk')
export class SystemChunkController {
    constructor(private readonly systemChunkService: SystemChunkService) {}

    @Get('/column/type')
    @ApiDecorator({
        operation: { summary: '字典类型' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseColumnSystemChunkType(@Request() request: OmixRequest) {
        return Object.values(enums.STATIC_SCHEMA_CHUNK_OPTIONS)
    }

    @Post('/create')
    @ApiDecorator({
        operation: { summary: '新增字典' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseCreateSystemChunk(@Request() request: OmixRequest, @Body() body: field.BaseCreateSystemChunk) {
        return await this.systemChunkService.httpBaseCreateSystemChunk(request, body)
    }

    @Post('/column')
    @ApiDecorator({
        operation: { summary: '字典列表' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseColumnSystemChunk(@Request() request: OmixRequest, @Body() body: field.BaseColumnSystemChunk) {
        return this.systemChunkService.httpBaseColumnSystemChunk(request, body)
    }

    @Post('/update')
    @ApiDecorator({
        operation: { summary: '编辑字典' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseUpdateSystemChunk(@Request() request: OmixRequest, @Body() body: field.BaseUpdateSystemChunk) {
        return await this.systemChunkService.httpBaseUpdateSystemChunk(request, body)
    }

    @Post('/update/state')
    @ApiDecorator({
        operation: { summary: '编辑字典状态' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseUpdateStateSystemChunk(@Request() request: OmixRequest, @Body() body: field.BaseUpdateStateSystemChunk) {
        return await this.systemChunkService.httpBaseUpdateStateSystemChunk(request, body)
    }

    @Post('/select')
    @ApiDecorator({
        operation: { summary: '批量获取字典分类列表' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseSelectSystemChunk(@Request() request: OmixRequest, @Body() body: field.BaseSelectSystemChunk) {
        return await this.systemChunkService.httpBaseSelectSystemChunk(request, body)
    }
}
