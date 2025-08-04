import { Post, Body, Request } from '@nestjs/common'
import { AccountService } from '@web-windows-server/modules/system/account/account.service'
import { ApifoxController, ApiServiceDecorator } from '@/decorator'
import { OmixRequest } from '@/interface'
import * as windows from '@web-windows-server/interface'

@ApifoxController('部门组织模块', 'system/dept')
export class DeptController {}
