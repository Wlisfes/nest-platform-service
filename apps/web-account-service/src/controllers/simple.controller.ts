import { Controller, Get, Post, Body, Query, Request } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ApiDecorator } from '@/decorator/compute.decorator'
import { OmixNotice, OmixRequest } from '@/interface/instance.resolver'
import { SimpleService } from '@web-account-service/services/simple.service'
import * as env from '@web-account-service/interface/instance.resolver'

@ApiTags('字典模块')
@Controller('simple')
export class SimpleController {
    constructor(private readonly simpleService: SimpleService) {}

    @Post('/create')
    @ApiDecorator({
        operation: { summary: '创建字典' },
        authorize: { source: 'manager', check: true },
        response: { status: 200, description: 'OK', type: OmixNotice }
    })
    public async httpCreateSimple(@Request() request: OmixRequest, @Body() body: env.BodyCreateSimple) {
        return await this.simpleService.httpCreateSimple(request.headers, request.member.staffId, body)
    }

    @Post('/stalk/list')
    @ApiDecorator({
        operation: { summary: '字典树' },
        authorize: { source: 'manager', check: true },
        response: { status: 200, description: 'OK', type: OmixNotice }
    })
    public async httpColumnStalkSimple(@Request() request: OmixRequest, @Body() body: env.BodyStalkSimple) {
        return await this.simpleService.httpColumnStalkSimple(request.headers, request.member.staffId, body)
    }

    @Post('/batch/list')
    @ApiDecorator({
        operation: { summary: '批量字典树' },
        authorize: { source: 'manager', check: true },
        response: { status: 200, description: 'OK', type: OmixNotice }
    })
    public async httpColumnBatchSimple(@Request() request: OmixRequest, @Body() body: env.BodyBatchSimple) {
        return await this.simpleService.httpColumnBatchSimple(request.headers, request.member.staffId, body)
    }
}
