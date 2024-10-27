import { Controller, Get, Post, Body, Query, Request } from '@nestjs/common'
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
        // return await this.routerService.httpCreateRouter(request.headers, request.member.id, body)
    }

    @Post('/update')
    @ApiDecorator({
        operation: { summary: '编辑菜单' },
        authorize: { source: 'manager', check: true },
        response: { status: 200, description: 'OK', type: OmixNotice }
    })
    public async httpUpdateRouter(@Request() request: OmixRequest, @Body() body: env.BodyUpdateRouter) {
        // return await this.routerService.httpUpdateRouter(request.headers, request.member.id, body)
    }

    @Post('/delete')
    @ApiDecorator({
        operation: { summary: '删除菜单' },
        authorize: { source: 'manager', check: true },
        response: { status: 200, description: 'OK', type: OmixNotice }
    })
    public async httpDeleteRouter(@Request() request: OmixRequest, @Body() body: env.BodyResolveRouter) {
        // return await this.routerService.httpDeleteRouter(request.headers, request.member.id, body)
    }

    @Post('/update/transform')
    @ApiDecorator({
        operation: { summary: '菜单状态变更' },
        authorize: { source: 'manager', check: true },
        response: { status: 200, description: 'OK', type: OmixNotice }
    })
    public async httpTransformRouter(@Request() request: OmixRequest, @Body() body: env.BodyTransformRouter) {
        // return await this.routerService.httpTransformRouter(request.headers, request.member.id, body)
    }

    @Post('/column')
    @ApiDecorator({
        operation: { summary: '菜单列表' },
        authorize: { source: 'manager', check: true },
        response: { status: 200, description: 'OK', type: OmixNotice }
    })
    public async httpColumnRouter(@Request() request: OmixRequest, @Body() body: env.BodyColumnRouter) {
        // return await this.routerService.httpColumnRouter(request.headers, request.member.id, body)
    }

    @Post('/column/tree')
    @ApiDecorator({
        operation: { summary: '菜单树列表' },
        authorize: { source: 'manager', check: true },
        response: { status: 200, description: 'OK', type: OmixNotice }
    })
    public async httpColumnTreeRouter(@Request() request: OmixRequest, @Body() body: env.BodyColumnTreeRouter) {
        // return await this.routerService.httpColumnTreeRouter(request.headers, request.member.id, body)
    }

    @Get('/resolve')
    @ApiDecorator({
        operation: { summary: '菜单详情' },
        authorize: { source: 'manager', check: true },
        response: { status: 200, description: 'OK', type: OmixNotice }
    })
    public async httpResolveRouter(@Request() request: OmixRequest, @Query() body: env.BodyResolveRouter) {
        // return await this.routerService.httpResolveRouter(request.headers, request.member.id, body)
    }
}
