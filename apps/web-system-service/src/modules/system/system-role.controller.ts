import { Controller, Post, Get, Body, Query, Request } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ApiDecorator } from '@/decorator/request.decorator'
import { OmixRequest } from '@/interface/instance.resolver'
import { SystemRoleService } from '@web-system-service/modules/system/system-role.service'
import * as field from '@web-system-service/interface/instance.resolver'

@ApiTags('角色权限模块')
@Controller('system/role')
export class SystemRoleController {
    constructor(private readonly systemRoleService: SystemRoleService) {}

    @Post('/create')
    @ApiDecorator({
        operation: { summary: '新增角色权限' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseCreateSystemRole(@Request() request: OmixRequest, @Body() body: field.BaseCreateSystemRole) {
        return await this.systemRoleService.httpBaseCreateSystemRole(request, body)
    }
}
