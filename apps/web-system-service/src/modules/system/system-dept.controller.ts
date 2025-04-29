import { Controller, Post, Get, Body, Query, Request } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ApiDecorator } from '@/decorator/request.decorator'
import { OmixRequest } from '@/interface/instance.resolver'
import { SystemDeptService } from '@web-system-service/modules/system/system-dept.service'
import * as field from '@web-system-service/interface/instance.resolver'

@ApiTags('部门模块')
@Controller('role')
export class SystemDeptController {
    constructor(private readonly systemDeptService: SystemDeptService) {}
}
