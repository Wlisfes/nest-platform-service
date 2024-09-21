import { Controller, Get, Post, Body, Query, Headers, Request } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
// import { UserService } from '@/services/user.service'
import { ApiDecorator } from '@/decorator/compute.decorator'

@ApiTags('用户模块')
@Controller('user')
export class UserController {}
