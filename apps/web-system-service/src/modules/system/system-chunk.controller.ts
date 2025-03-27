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
    public async httpBaseColumnSystemDictType(@Request() request: OmixRequest) {
        console.log(enums.SchemaDictTypeOptions)
    }

    @Post('/create')
    @ApiDecorator({
        operation: { summary: '新增字典' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseCreateSystemChunk(@Request() request: OmixRequest, @Body() body: field.BaseCreateSystemChunk) {
        // return await this.systemChunkService.httpBaseCreateSystemChunk(request, body)
    }
}
