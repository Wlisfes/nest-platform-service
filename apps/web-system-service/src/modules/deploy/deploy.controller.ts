import { Controller, Post, Get, Body, Request, Response } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ApiDecorator } from '@/decorator/request.decorator'
import { OmixRequest } from '@/interface/instance.resolver'
import { DeployCodexService } from '@web-system-service/modules/deploy/deploy-codex.service'
import { DeployEnumsService } from '@web-system-service/modules/deploy/deploy-enums.service'
import { DeployKinesService } from '@web-system-service/modules/deploy/deploy-kines.service'
import * as field from '@web-system-service/interface/instance.resolver'

@ApiTags('通用模块配置')
@Controller('deploy')
export class DeployController {
    constructor(
        private readonly deployCodexService: DeployCodexService,
        private readonly deployEnumsService: DeployEnumsService,
        private readonly deployKinesService: DeployKinesService
    ) {}

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

    @Post('/kines/update')
    @ApiDecorator({
        operation: { summary: '更新自定义json' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseDeployKinesUpdate(@Request() request: OmixRequest, @Body() body: field.BaseDeployKinesUpdate) {
        return await this.deployKinesService.httpBaseDeployKinesUpdate(request, body)
    }

    @Post('/kines/resolver')
    @ApiDecorator({
        operation: { summary: '查询自定义json' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseDeployKinesCompiler(@Request() request: OmixRequest, @Body() body: field.BaseDeployKinesCompiler) {
        return await this.deployKinesService.httpBaseDeployKinesCompiler(request, body)
    }
}
