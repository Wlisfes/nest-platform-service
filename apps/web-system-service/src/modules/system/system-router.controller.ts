import { Controller, Post, Get, Body, Query, Request } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ApiDecorator } from '@/decorator/request.decorator'
import { OmixRequest } from '@/interface/instance.resolver'
import { SystemRouterService } from '@web-system-service/modules/system/system-router.service'
import * as schemas from '@web-system-service/interface/router.resolver'

@ApiTags('菜单资源模块')
@Controller('system/router')
export class SystemRouterController {
    constructor(private readonly systemRouterService: SystemRouterService) {}

    @Post('/create')
    @ApiDecorator({
        operation: { summary: '创建菜单资源' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseCreateSystemRouter(@Request() request: OmixRequest, @Body() body: schemas.BaseCreateSystemRouter) {
        return await this.systemRouterService.httpBaseCreateSystemRouter(request, body)
    }

    @Post('/update')
    @ApiDecorator({
        operation: { summary: '编辑菜单资源' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseUpdateSystemRouter(@Request() request: OmixRequest, @Body() body: schemas.BaseUpdateSystemRouter) {
        return this.systemRouterService.httpBaseUpdateSystemRouter(request, body)
    }

    @Post('/column')
    @ApiDecorator({
        operation: { summary: '菜单资源列表' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseColumnSystemRouter(@Request() request: OmixRequest, @Body() body: schemas.BaseColumnSystemRouter) {
        return this.systemRouterService.httpBaseColumnSystemRouter(request, body)
    }

    @Get('/resolver')
    @ApiDecorator({
        operation: { summary: '菜单资源列表' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseSystemRouterResolver(@Request() request: OmixRequest, @Query() query: schemas.BaseSystemRouterResolver) {
        return this.systemRouterService.httpBaseSystemRouterResolver(request, query)
    }
}
