import { Post, Body, Request } from '@nestjs/common'
import { CrmClientService } from '@web-windows-server/modules/crm/client/client.service'
import { ApifoxController, ApiServiceDecorator } from '@/decorator'
import { OmixRequest } from '@/interface'
import * as windows from '@web-windows-server/interface'

@ApifoxController('销售管理-我的客户', 'crm/client')
export class CrmClientController {
    constructor(private readonly crmClientService: CrmClientService) {}

    @ApiServiceDecorator(Post('/common/consumer'), {
        windows: true,
        operation: { summary: '客户分页列表' },
        response: { status: 200, description: 'OK', type: windows.BaseCrmClientCommonConsumerOptionsResponse }
    })
    public async httpBaseCrmClientCommonConsumer(
        @Request() request: OmixRequest,
        @Body() body: windows.BaseCrmClientCommonConsumerOptions
    ) {
        return await this.crmClientService.httpBaseCrmClientCommonConsumer(request, body)
    }

    @ApiServiceDecorator(Post('/resolver'), {
        windows: true,
        operation: { summary: '客户详情' },
        response: { status: 200, description: 'OK', type: windows.BaseCrmClientResolverOptionsResponse }
    })
    public async httpBaseCrmClientResolver(@Request() request: OmixRequest, @Body() body: windows.BaseCrmClientResolverOptions) {
        return await this.crmClientService.httpBaseCrmClientResolver(request, body)
    }
}
