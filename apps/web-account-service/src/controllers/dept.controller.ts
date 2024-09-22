import { Controller, Get, Post, Body, Query, Headers, Request } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ApiDecorator } from '@/decorator/compute.decorator'
import { OmixNotice, OmixHeaders } from '@/interface/instance.resolver'
import { DeptService } from '@web-account-service/services/dept.service'
import * as env from '@web-account-service/interface/instance.resolver'

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
    public async httpCreateDept(@Headers() headers: OmixHeaders, @Body() body: env.BodyCreateDept) {
        return await this.deptService.httpCreateDept(headers, body)
    }

    @Post('/update')
    @ApiDecorator({
        operation: { summary: '编辑部门' },
        authorize: { source: 'manager', check: true },
        response: { status: 200, description: 'OK', type: OmixNotice }
    })
    public async httpUpdateDept(@Headers() headers: OmixHeaders, @Body() body: env.BodyUpdateDept) {
        return await this.deptService.httpUpdateDept(headers, body)
    }
}
