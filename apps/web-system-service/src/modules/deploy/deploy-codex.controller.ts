import { Controller, Get, Request, Response } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ApiDecorator } from '@/decorator/request.decorator'
import { OmixRequest } from '@/interface/instance.resolver'
import { DeployCodexService } from '@web-system-service/modules/deploy/deploy-codex.service'

@ApiTags('验证码模块')
@Controller('deploy/codex')
export class DeployCodexController {
    constructor(private readonly deployCodexService: DeployCodexService) {}

    @Get('/token/write')
    @ApiDecorator({
        operation: { summary: '昆仑登录图形验证码' },
        response: { status: 200, description: 'OK' }
    })
    public async httpDeployCodexTokenWrite(@Request() request: OmixRequest, @Response() response) {
        return await this.deployCodexService.httpDeployCodexTokenWrite(request, response)
    }
}
