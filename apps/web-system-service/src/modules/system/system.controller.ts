import { Controller, Post, Get, Body, Request, Response } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ApiDecorator } from '@/decorator/request.decorator'
import { OmixRequest } from '@/interface/instance.resolver'

@ApiTags('系统配置模块')
@Controller('system')
export class SystemController {
    @Get('/create')
    @ApiDecorator({
        operation: { summary: '创建系统配置' },
        response: { status: 200, description: 'OK' }
    })
    public async httpCreateSystem(@Request() request: OmixRequest, @Response() response) {}
}
