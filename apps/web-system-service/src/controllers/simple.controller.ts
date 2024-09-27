import { Controller, Get, Post, Body, Query, Request } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ApiDecorator } from '@/decorator/compute.decorator'
import { OmixNotice, OmixRequest } from '@/interface/instance.resolver'
import { SimpleService } from '@web-system-service/services/simple.service'
import * as env from '@web-system-service/interface/instance.resolver'

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
        operation: { summary: '批量字典树' },
        authorize: { source: 'manager', check: true },
        response: { status: 200, description: 'OK', type: OmixNotice }
    })
    public async httpColumnSimple(@Request() request: OmixRequest, @Body() body: env.BodyColumnSimple) {
        return await this.simpleService.httpColumnSimple(request.headers, request.member.staffId, body)
    }

    @Post('/stalk/list')
    @ApiDecorator({
        operation: { summary: '字典树' },
        authorize: { source: 'manager', check: true },
        response: { status: 200, description: 'OK', type: OmixNotice }
    })
    public async httpColumnStalkSimple(@Request() request: OmixRequest, @Query() body: env.BodyStalkSimple) {
        return await this.simpleService.httpColumnStalkSimple(request.headers, request.member.staffId, body)
    }

    @Get('/stalk')
    @ApiDecorator({
        operation: { summary: '字典类型' },
        authorize: { source: 'manager', check: true },
        response: { status: 200, description: 'OK', type: OmixNotice }
    })
    public async httpColumnStalk(@Request() request: OmixRequest) {
        return await this.simpleService.httpColumnStalk(request.headers, request.member.staffId)
    }
}
