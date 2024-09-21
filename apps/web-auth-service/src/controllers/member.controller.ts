import { Controller, Get, Post, Body, Query, Headers, Request } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
// import { UserService } from '@/services/user.service'
import { ApiDecorator } from '@/decorator/compute.decorator'

@ApiTags('员工模块')
@Controller('member')
export class MemberController {}
