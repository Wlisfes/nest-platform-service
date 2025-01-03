import { Controller, Post, Get, Body, Request } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ApiDecorator } from '@/decorator/request.decorator'
import { OmixRequest } from '@/interface/instance.resolver'
import { SystemService } from '@web-system-service/modules/system/system.service'
import * as systemUser from '@web-system-service/interface/system.resolver'

@ApiTags('系统配置模块')
@Controller('system')
export class SystemController {
    constructor(private readonly systemService: SystemService) {}

    @Post('/base/create')
    @ApiDecorator({
        operation: { summary: '创建系统配置' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true }
    })
    public async httpBaseCreateSystem(@Request() request: OmixRequest, @Body() body: systemUser.BaseCreateSystem) {
        return this.systemService.httpCommonBaseCreateSystem(request, body)
    }
}
