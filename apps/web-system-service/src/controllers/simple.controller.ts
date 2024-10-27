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

    @Post('/stalk')
    @ApiDecorator({
        operation: { summary: '字典类型' },
        authorize: { source: 'manager', check: true },
        response: { status: 200, description: 'OK', type: OmixNotice }
    })
    public async httpColumnStalk(@Request() request: OmixRequest) {
        return await this.simpleService.httpColumnStalk(request.headers, request)
    }

    @Post('/update')
    @ApiDecorator({
        operation: { summary: '更新字典' },
        authorize: { source: 'manager', check: true },
        response: { status: 200, description: 'OK', type: OmixNotice }
    })
    public async httpUpdateSimple(@Request() request: OmixRequest, @Body() body: env.BodyUpdateSimple) {
        return await this.simpleService.httpUpdateSimple(request.headers, request, body)
    }

    @Post('/list')
    @ApiDecorator({
        operation: { summary: '字典列表' },
        authorize: { source: 'manager', check: true },
        response: { status: 200, description: 'OK', type: OmixNotice }
    })
    public async httpColumnSimple(@Request() request: OmixRequest, @Body() body: env.BodyColumnSimple) {
        return await this.simpleService.httpColumnSimple(request.headers, request, body)
    }

    @Get('/resolve')
    @ApiDecorator({
        operation: { summary: '字典详情' },
        authorize: { source: 'manager', check: true },
        response: { status: 200, description: 'OK', type: OmixNotice }
    })
    public async httpResolveSimple(@Request() request: OmixRequest, @Query() body: env.BodyResolveSimple) {
        return await this.simpleService.httpResolveSimple(request.headers, request, body)
    }
}
