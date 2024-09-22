import { Controller, Post, Body, Request } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ApiDecorator } from '@/decorator/compute.decorator'
import { OmixNotice, OmixRequest } from '@/interface/instance.resolver'
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
    public async httpCreateMember(@Request() request: OmixRequest, @Body() body: env.BodyCreateMember) {
        return await this.memberService.httpCreateMember(request.headers, request.member.staffId, body)
    }

    @Post('/list')
    @ApiDecorator({
        operation: { summary: '员工账号列表' },
        authorize: { source: 'manager', check: true },
        response: { status: 200, description: 'OK', type: OmixNotice }
    })
    public async httpColumnMember(@Request() request: OmixRequest, @Body() body: env.BodyColumnMember) {
        return await this.memberService.httpColumnMember(request.headers, request.member.staffId, body)
    }
}
