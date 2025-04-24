import { Controller, Post, Get, Body, Query, Request } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ApiDecorator } from '@/decorator/request.decorator'
import { OmixRequest } from '@/interface/instance.resolver'
import { SystemRouterService } from '@web-system-service/modules/system/system-router.service'
import * as field from '@web-system-service/interface/instance.resolver'

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
    public async httpBaseSystemRouterCreate(@Request() request: OmixRequest, @Body() body: field.BaseSystemRouterCreate) {
        return await this.systemRouterService.httpBaseSystemRouterCreate(request, body)
    }

    @Post('/update')
    @ApiDecorator({
        operation: { summary: '编辑菜单' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseSystemRouterUpdate(@Request() request: OmixRequest, @Body() body: field.BaseSystemRouterUpdate) {
        return this.systemRouterService.httpBaseSystemRouterUpdate(request, body)
    }

    @Post('/update/state')
    @ApiDecorator({
        operation: { summary: '编辑菜单状态' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseSystemSwitchRouter(@Request() request: OmixRequest, @Body() body: field.BaseSystemSwitchRouter) {
        return await this.systemRouterService.httpBaseSystemSwitchRouter(request, body)
    }

    @Post('/delete')
    @ApiDecorator({
        operation: { summary: '删除菜单' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseSystemRouterDelete(@Request() request: OmixRequest, @Body() body: field.BaseSystemRouterResolver) {
        return await this.systemRouterService.httpBaseSystemRouterDelete(request, body)
    }

    @Post('/column')
    @ApiDecorator({
        operation: { summary: '菜单列表' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseSystemColumnRouter(@Request() request: OmixRequest, @Body() body: field.BaseSystemColumnRouter) {
        return this.systemRouterService.httpBaseSystemColumnRouter(request, body)
    }

    @Get('/column/tree')
    @ApiDecorator({
        operation: { summary: '菜单列表树' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseColumnTreeSystemRouter(@Request() request: OmixRequest) {
        return this.systemRouterService.httpBaseColumnTreeSystemRouter(request)
    }

    @Get('/column/user')
    @ApiDecorator({
        operation: { summary: '获取当前用户菜单' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseSystemUserRouter(@Request() request: OmixRequest) {
        return this.systemRouterService.httpBaseSystemUserRouter(request)
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
