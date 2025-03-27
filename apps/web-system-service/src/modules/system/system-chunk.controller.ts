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
        return Object.keys(enums.SCHEMA_CHUNK_OPTIONS).map(value => ({ name: enums.SCHEMA_CHUNK_OPTIONS[value], value }))
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
}
