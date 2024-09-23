import { Controller, Get, Post, Body, Query, Request } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ApiDecorator } from '@/decorator/compute.decorator'
import { OmixNotice, OmixRequest } from '@/interface/instance.resolver'
import { PostService } from '@web-account-service/services/post.service'
import * as env from '@web-account-service/interface/instance.resolver'

@ApiTags('职位模块')
@Controller('post')
export class PostController {
    constructor(private readonly postService: PostService) {}
}
