import { Controller, Get, Post, Body, Request } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ApiDecorator } from '@/decorator/compute.decorator'
import { OmixNotice, OmixRequest } from '@/interface/instance.resolver'
import { RouterService } from '@web-system-service/services/router.service'
import * as env from '@web-system-service/interface/instance.resolver'

@ApiTags('路由菜单模块')
@Controller('router')
export class RouterController {
    constructor(private readonly routerService: RouterService) {}

    @Post('/create')
    @ApiDecorator({
        operation: { summary: '创建菜单' },
        authorize: { source: 'manager', check: true },
        response: { status: 200, description: 'OK', type: OmixNotice }
    })
    public async httpCreateRouter(@Request() request: OmixRequest, @Body() body: env.BodyCreateRouter) {
        return await this.routerService.httpCreateRouter(request.headers, request.member.staffId, body)
    }
}
