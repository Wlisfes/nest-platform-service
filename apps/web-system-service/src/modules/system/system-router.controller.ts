import { Controller, Post, Get, Body, Query, Request } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ApiDecorator } from '@/decorator/request.decorator'
import { OmixRequest } from '@/interface/instance.resolver'
import { SystemRouterService } from '@web-system-service/modules/system/system-router.service'
import * as field from '@web-system-service/interface/router.resolver'

@ApiTags('菜单模块')
@Controller('router')
export class SystemRouterController {
    constructor(private readonly systemRouterService: SystemRouterService) {}

    @Post('/create')
    @ApiDecorator({
        operation: { summary: '创建菜单' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseCreateSystemRouter(@Request() request: OmixRequest, @Body() body: field.BaseCreateSystemRouter) {
        return await this.systemRouterService.httpBaseCreateSystemRouter(request, body)
    }

    @Post('/update')
    @ApiDecorator({
        operation: { summary: '编辑菜单' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseUpdateSystemRouter(@Request() request: OmixRequest, @Body() body: field.BaseUpdateSystemRouter) {
        return this.systemRouterService.httpBaseUpdateSystemRouter(request, body)
    }

    @Post('/update/state')
    @ApiDecorator({
        operation: { summary: '编辑菜单状态' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseUpdateStateSystemRouter(@Request() request: OmixRequest, @Body() body: field.BaseStateSystemRouter) {
        return await this.systemRouterService.httpBaseUpdateStateSystemRouter(request, body)
    }

    @Post('/column')
    @ApiDecorator({
        operation: { summary: '菜单列表' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseColumnSystemRouter(@Request() request: OmixRequest, @Body() body: field.BaseColumnSystemRouter) {
        return this.systemRouterService.httpBaseColumnSystemRouter(request, body)
    }

    @Get('/user')
    @ApiDecorator({
        operation: { summary: '获取当前用户菜单' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseColumnUserSystemRouter(@Request() request: OmixRequest) {
        return this.systemRouterService.httpBaseColumnUserSystemRouter(request)
    }

    @Get('/resolver')
    @ApiDecorator({
        operation: { summary: '菜单资源' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseSystemRouterResolver(@Request() request: OmixRequest, @Query() query: field.BaseSystemRouterResolver) {
        return this.systemRouterService.httpBaseSystemRouterResolver(request, query)
    }
}
