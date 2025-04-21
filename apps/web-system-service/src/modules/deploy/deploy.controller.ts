import { Controller, Post, Get, Body, Request, Response } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ApiDecorator } from '@/decorator/request.decorator'
import { OmixRequest } from '@/interface/instance.resolver'
import { DeployCodexService } from '@web-system-service/modules/deploy/deploy-codex.service'
import { DeployEnumsService } from '@web-system-service/modules/deploy/deploy-enums.service'
import * as field from '@web-system-service/interface/instance.resolver'

@ApiTags('通用模块配置')
@Controller('deploy')
export class DeployController {
    constructor(private readonly deployCodexService: DeployCodexService, private readonly deployEnumsService: DeployEnumsService) {}

    @Get('/codex/token/write')
    @ApiDecorator({
        operation: { summary: '昆仑登录图形验证码' },
        response: { status: 200, description: 'OK' }
    })
    public async httpDeployCodexTokenWrite(@Request() request: OmixRequest, @Response() response) {
        return await this.deployCodexService.httpDeployCodexTokenWrite(request, response)
    }

    @Post('/enums/column/types')
    @ApiDecorator({
        operation: { summary: '获取枚举来源类型' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseDeployEnumsTypes(@Request() request: OmixRequest) {
        return await this.deployEnumsService.httpBaseDeployEnumsTypes(request)
    }

    @Post('/enums/column/select')
    @ApiDecorator({
        operation: { summary: '批量获取枚举分类列表' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseDeployEnumsCompiler(@Request() request: OmixRequest, @Body() body: field.BaseDeployEnumsCompiler) {
        return await this.deployEnumsService.httpBaseDeployEnumsCompiler(request, body)
    }
}
