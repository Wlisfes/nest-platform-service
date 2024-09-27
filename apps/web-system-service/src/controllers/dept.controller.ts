import { Controller, Get, Post, Body, Request } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ApiDecorator } from '@/decorator/compute.decorator'
import { OmixNotice, OmixRequest } from '@/interface/instance.resolver'
import { DeptService } from '@web-system-service/services/dept.service'
import * as env from '@web-system-service/interface/instance.resolver'

@ApiTags('部门模块')
@Controller('dept')
export class DeptController {
    constructor(private readonly deptService: DeptService) {}

    @Post('/create')
    @ApiDecorator({
        operation: { summary: '创建部门' },
        authorize: { source: 'manager', check: true },
        response: { status: 200, description: 'OK', type: OmixNotice }
    })
    public async httpCreateDept(@Request() request: OmixRequest, @Body() body: env.BodyCreateDept) {
        return await this.deptService.httpCreateDept(request.headers, request.member.staffId, body)
    }

    @Post('/update')
    @ApiDecorator({
        operation: { summary: '编辑部门' },
        authorize: { source: 'manager', check: true },
        response: { status: 200, description: 'OK', type: OmixNotice }
    })
    public async httpUpdateDept(@Request() request: OmixRequest, @Body() body: env.BodyUpdateDept) {
        return await this.deptService.httpUpdateDept(request.headers, request.member.staffId, body)
    }

    @Get('/tree')
    @ApiDecorator({
        operation: { summary: '部门树' },
        authorize: { source: 'manager', check: true },
        response: { status: 200, description: 'OK', type: OmixNotice }
    })
    public async httpTreeDept(@Request() request: OmixRequest) {
        return await this.deptService.httpTreeDept(request.headers, request.member.staffId)
    }
}
