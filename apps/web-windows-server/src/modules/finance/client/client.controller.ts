import { Post, Body, Request } from '@nestjs/common'
import { ClientService } from '@web-windows-server/modules/finance/client/client.service'
import { ApifoxController, ApiServiceDecorator } from '@/decorator'
import { OmixRequest } from '@/interface'
import * as windows from '@web-windows-server/interface'

@ApifoxController('C端客户管理', 'finance/client')
export class ClientController {
    constructor(private readonly clientService: ClientService) {}

    @ApiServiceDecorator(Post('create'), {
        windows: true,
        operation: { summary: '新增客户' },
        response: { status: 200, description: 'OK', type: windows.OmixPayloadResponse }
    })
    public async httpBaseFinanceCreateClient(@Request() request: OmixRequest, @Body() body: windows.CreateClientOptions) {
        return await this.clientService.httpBaseFinanceCreateClient(request, body)
    }

    @ApiServiceDecorator(Post('update'), {
        windows: true,
        operation: { summary: '编辑客户' },
        response: { status: 200, description: 'OK', type: windows.OmixPayloadResponse }
    })
    public async httpBaseFinanceUpdateClient(@Request() request: OmixRequest, @Body() body: windows.UpdateClientOptions) {
        return await this.clientService.httpBaseFinanceUpdateClient(request, body)
    }

    @ApiServiceDecorator(Post('column'), {
        windows: true,
        operation: { summary: '客户分页列表' },
        response: { status: 200, description: 'OK', type: windows.ColumnClientOptionsResponse }
    })
    public async httpBaseFinanceColumnClient(@Request() request: OmixRequest, @Body() body: windows.ColumnClientOptions) {
        return await this.clientService.httpBaseFinanceColumnClient(request, body)
    }

    @ApiServiceDecorator(Post('update/status'), {
        windows: true,
        operation: { summary: '客户状态修改' },
        response: { status: 200, description: 'OK', type: windows.OmixPayloadResponse }
    })
    public async httpBaseFinanceUpdateClientStatus(@Request() request: OmixRequest, @Body() body: windows.UpdateClientStatusOptions) {
        return await this.clientService.httpBaseFinanceUpdateClientStatus(request, body)
    }
}
