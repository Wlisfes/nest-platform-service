import { Controller, Post, Get, Body, Request } from '@nestjs/common'
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
        authorize: { check: true }
    })
    public async httpBaseCreateSystemRouter(@Request() request: OmixRequest, @Body() body: schemas.BaseCreateSystemRouter) {
        return await this.systemRouterService.httpBaseCreateSystemRouter(request, body)
    }

    @Post('/update')
    @ApiDecorator({
        operation: { summary: '编辑菜单资源' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true }
    })
    public async httpBaseUpdateSystemRouter(@Request() request: OmixRequest, @Body() body: schemas.BaseUpdateSystemRouter) {
        return this.systemRouterService.httpBaseUpdateSystemRouter(request, body)
    }
}
