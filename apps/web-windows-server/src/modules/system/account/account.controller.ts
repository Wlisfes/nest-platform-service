import { Post, Body, Request } from '@nestjs/common'
import { DeployAccountService } from '@web-windows-server/modules/system/account/account.service'
import { ApifoxController, ApiServiceDecorator } from '@/decorator'
import { OmixRequest, OmixPayloadResponse } from '@/interface'
import * as windows from '@web-windows-server/interface'

@ApifoxController('账号模块', 'system/account')
export class DeployAccountController {
    constructor(private readonly accountService: DeployAccountService) {}

    @ApiServiceDecorator(Post('/create'), {
        operation: { summary: '新增账号' },
        response: { status: 200, description: 'OK', type: OmixPayloadResponse },
        windows: true
    })
    public async httpBaseSystemCreateAccount(@Request() request: OmixRequest, @Body() body: windows.CreateAccountOptions) {
        return await this.accountService.httpBaseSystemCreateAccount(request, body)
    }

    @ApiServiceDecorator(Post('/column'), {
        operation: { summary: '分页列表查询' },
        response: { status: 200, description: 'OK', type: windows.ColumnAccountOptionsResponse },
        windows: true
    })
    public async httpBaseSystemColumnAccount(@Request() request: OmixRequest, @Body() body: windows.ColumnAccountOptions) {
        return await this.accountService.httpBaseSystemColumnAccount(request, body)
    }

    @ApiServiceDecorator(Post('resolver'), {
        windows: true,
        operation: { summary: '账号详情' },
        response: { status: 200, description: 'OK', type: windows.AccountPayloadOptionsResponse }
    })
    public async httpBaseSystemAccountResolver(@Request() request: OmixRequest, @Body() body: windows.AccountPayloadOptions) {
        return await this.accountService.httpBaseSystemAccountResolver(request, body)
    }

    @ApiServiceDecorator(Post('/update'), {
        operation: { summary: '编辑账号' },
        response: { status: 200, description: 'OK', type: OmixPayloadResponse },
        windows: true
    })
    public async httpBaseSystemUpdateAccount(@Request() request: OmixRequest, @Body() body: windows.UpdateAccountOptions) {
        return await this.accountService.httpBaseSystemUpdateAccount(request, body)
    }

    @ApiServiceDecorator(Post('/switch/update'), {
        operation: { summary: '编辑账号状态' },
        response: { status: 200, description: 'OK', type: OmixPayloadResponse },
        windows: true
    })
    public async httpBaseSystemUpdateSwitchAccount(@Request() request: OmixRequest, @Body() body: windows.UpdateSwitchAccountOptions) {
        return await this.accountService.httpBaseSystemUpdateSwitchAccount(request, body)
    }

    @ApiServiceDecorator(Post('/delete'), {
        operation: { summary: '删除账号' },
        response: { status: 200, description: 'OK', type: OmixPayloadResponse },
        windows: true
    })
    public async httpBaseSystemDeleteAccount(@Request() request: OmixRequest, @Body() body: windows.DeleteAccountOptions) {
        return await this.accountService.httpBaseSystemDeleteAccount(request, body)
    }

    @ApiServiceDecorator(Post('/select'), {
        operation: { summary: '账号下拉列表' },
        response: { status: 200, description: 'OK', type: windows.SelectAccountOptionsResponse },
        windows: true
    })
    public async httpBaseSystemSelectAccount(@Request() request: OmixRequest) {
        return await this.accountService.httpBaseSystemSelectAccount(request)
    }
}
