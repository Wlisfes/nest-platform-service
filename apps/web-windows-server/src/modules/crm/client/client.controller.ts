import { Post, Body, Request } from '@nestjs/common'
import { CrmClientService } from '@web-windows-server/modules/crm/client/client.service'
import { CrmClientSmsService } from '@web-windows-server/modules/crm/client/client.sms.service'
import { ApifoxController, ApiServiceDecorator } from '@/decorator'
import { OmixRequest } from '@/interface'
import * as windows from '@web-windows-server/interface'

@ApifoxController('销售管理-我的客户', 'crm/client')
export class CrmClientController {
    constructor(private readonly crmClientService: CrmClientService, private readonly crmClientSmsService: CrmClientSmsService) {}

    @ApiServiceDecorator(Post('/common/create'), {
        windows: true,
        operation: { summary: '新增客户' },
        response: { status: 200, description: 'OK', type: windows.OmixPayloadResponse }
    })
    public async httpBaseCrmClientCommonCreate(@Request() request: OmixRequest, @Body() body: windows.BaseCrmClientCommonCreateOptions) {
        return await this.crmClientService.httpBaseCrmClientCommonCreate(request, body)
    }

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

    @ApiServiceDecorator(Post('/sms/column'), {
        windows: true,
        operation: { summary: '客户短信应用列表' },
        response: { status: 200, description: 'OK', type: windows.BaseCrmClientSmsColumnOptionsResponse }
    })
    public async httpBaseCrmClientSmsColumn(@Request() request: OmixRequest, @Body() body: windows.BaseCrmClientSmsColumnOptions) {
        return await this.crmClientSmsService.httpBaseCrmClientSmsColumn(request, body)
    }

    @ApiServiceDecorator(Post('/sms/create'), {
        windows: true,
        operation: { summary: '新增客户短信应用' },
        response: { status: 200, description: 'OK', type: windows.OmixPayloadResponse }
    })
    public async httpBaseCrmClientSmsCreate(@Request() request: OmixRequest, @Body() body: windows.BaseCrmClientSmsCreateOptions) {
        return await this.crmClientSmsService.httpBaseCrmClientSmsCreate(request, body)
    }

    @ApiServiceDecorator(Post('/select'), {
        windows: true,
        operation: { summary: '客户下拉列表' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseCrmClientSelect(@Request() request: OmixRequest) {
        return await this.crmClientService.httpBaseCrmClientSelect(request)
    }

    @ApiServiceDecorator(Post('/sms/select'), {
        windows: true,
        operation: { summary: '客户短信应用下拉列表' },
        response: { status: 200, description: 'OK' }
    })
    public async httpBaseCrmClientSmsSelect(@Request() request: OmixRequest, @Body() body: windows.BaseCrmClientSmsSelectOptions) {
        return await this.crmClientSmsService.httpBaseCrmClientSmsSelect(request, body)
    }
}
