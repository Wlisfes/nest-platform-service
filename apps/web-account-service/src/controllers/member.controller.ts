import { Controller, Get, Post, Body, Query, Headers, Request } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ApiDecorator } from '@/decorator/compute.decorator'
import { OmixNotice, OmixHeaders } from '@/interface/instance.resolver'
import { MemberService } from '@web-account-service/services/member.service'
import * as env from '@web-account-service/interface/instance.resolver'

@ApiTags('员工模块')
@Controller('member')
export class MemberController {
    constructor(private readonly memberService: MemberService) {}

    @Post('/create')
    @ApiDecorator({
        operation: { summary: '创建员工账号' },
        authorize: { source: 'manager', check: true },
        response: { status: 200, description: 'OK', type: OmixNotice }
    })
    public async httpCreateMember(@Headers() headers: OmixHeaders, @Body() body: env.BodyCreateMember) {
        return await this.memberService.httpCreateMember(headers, body)
    }

    @Post('/list')
    @ApiDecorator({
        operation: { summary: '员工账号列表' },
        authorize: { source: 'manager', check: true },
        response: { status: 200, description: 'OK', type: OmixNotice }
    })
    public async httpColumnMember(@Headers() headers: OmixHeaders, @Body() body: env.BodyColumnMember) {
        return await this.memberService.httpColumnMember(headers, body)
    }
}
