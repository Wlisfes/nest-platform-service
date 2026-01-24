import { Post, Body, Request } from '@nestjs/common'
import { AccountService } from '@web-windows-server/modules/system/account/account.service'
import { ApifoxController, ApiServiceDecorator } from '@/decorator'
import { OmixRequest } from '@/interface'
import * as windows from '@web-windows-server/interface'

@ApifoxController('账号模块', 'system/account')
export class AccountController {
    constructor(private readonly accountService: AccountService) {}

    @ApiServiceDecorator(Post('/create'), {
        operation: { summary: '添加账号' },
        response: { status: 200, description: 'OK' },
        windows: true
    })
    public async httpBaseSystemCreateAccount(@Request() request: OmixRequest, @Body() body: windows.CreateAccountOptions) {
        return await this.accountService.httpBaseSystemCreateAccount(request, body)
    }

    @ApiServiceDecorator(Post('/column'), {
        operation: { summary: '账号列表' },
        response: { status: 200, description: 'OK' },
        windows: true
    })
    public async httpBaseSystemColumnAccount(@Request() request: OmixRequest, @Body() body: windows.ColumnAccountOptions) {
        return await this.accountService.httpBaseSystemColumnAccount(request, body)
    }

    @ApiServiceDecorator(Post('/update/switch'), {
        operation: { summary: '编辑账号状态' },
        response: { status: 200, description: 'OK' },
        windows: true
    })
    public async httpBaseSystemUpdateSwitchAccount(@Request() request: OmixRequest, @Body() body: windows.UpdateSwitchAccountOptions) {
        return await this.accountService.httpBaseSystemUpdateSwitchAccount(request, body)
    }
}
