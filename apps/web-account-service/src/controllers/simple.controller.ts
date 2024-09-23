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

    @Post('/list')
    @ApiDecorator({
        operation: { summary: '字典树' },
        authorize: { source: 'manager', check: true },
        response: { status: 200, description: 'OK', type: OmixNotice }
    })
    public async httpColumnSimple(@Request() request: OmixRequest, @Body() body) {
        return await this.simpleService.httpColumnSimple(request.headers, request.member.staffId, body)
    }
}
