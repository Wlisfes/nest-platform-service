import { Controller, Get, Post, Body, Query, Headers, Request } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ApiDecorator } from '@/decorator/compute.decorator'
import { OmixNotice, OmixHeaders } from '@/interface/instance.resolver'
import { MemberService } from '@web-auth-service/services/member.service'
import * as env from '@web-auth-service/interface/instance.resolver'

@ApiTags('员工模块')
@Controller('member')
export class MemberController {
    constructor(private readonly memberService: MemberService) {}

    @Post('/create')
    @ApiDecorator({
        operation: { summary: '创建员工账号' },
        response: { status: 200, description: 'OK', type: OmixNotice }
    })
    public async httpCreateMember(@Headers() headers: OmixHeaders, @Body() body: env.BodyCreateMember) {
        return await this.memberService.httpCreateMember(headers, body)
    }
}
