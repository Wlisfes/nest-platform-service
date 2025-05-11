import { Controller, Post, Get, Body, Query, Request } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ApiDecorator } from '@/decorator/request.decorator'
import { OmixRequest } from '@/interface/instance.resolver'
import { SystemDeptService } from '@web-system-service/modules/system/system-dept.service'
import * as field from '@web-system-service/interface/instance.resolver'

@ApiTags('部门模块')
@Controller('dept')
export class SystemDeptController {
    constructor(private readonly systemDeptService: SystemDeptService) {}

    @Post('/create')
    @ApiDecorator({
        operation: { summary: '新增部门' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseSystemDeptCreate(@Request() request: OmixRequest, @Body() body: field.BaseSystemDeptCreate) {
        return await this.systemDeptService.httpBaseSystemDeptCreate(request, body)
    }

    @Post('/update')
    @ApiDecorator({
        operation: { summary: '编辑部门' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseSystemDeptUpdate(@Request() request: OmixRequest, @Body() body: field.BaseSystemDeptUpdate) {
        return await this.systemDeptService.httpBaseSystemDeptUpdate(request, body)
    }

    @Post('/delete')
    @ApiDecorator({
        operation: { summary: '删除部门' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseSystemDeptDelete(@Request() request: OmixRequest, @Body() body: field.BaseSystemDeptResolver) {
        return await this.systemDeptService.httpBaseSystemDeptDelete(request, body)
    }

    @Post('/cascader')
    @ApiDecorator({
        operation: { summary: '完整部门树' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseSystemDeptCascader(@Request() request: OmixRequest) {
        return this.systemDeptService.httpBaseSystemDeptCascader(request)
    }

    @Post('/column')
    @ApiDecorator({
        operation: { summary: '部门列表' },
        response: { status: 200, description: 'OK' },
        authorize: { check: true, platform: 'manager' }
    })
    public async httpBaseSystemDeptColumn(@Request() request: OmixRequest) {
        return this.systemDeptService.httpBaseSystemDeptColumn(request)
    }
}
