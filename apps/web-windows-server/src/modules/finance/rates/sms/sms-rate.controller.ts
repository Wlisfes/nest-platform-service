import { Post, Body, Request } from '@nestjs/common'
import { FinanceSmsRateService } from '@web-windows-server/modules/finance/rates/sms/sms-rate.service'
import { ApifoxController, ApiServiceDecorator } from '@/decorator'
import { OmixRequest } from '@/interface'
import * as windows from '@web-windows-server/interface'

@ApifoxController('短信基础价格管理', 'finance/rates/sms')
export class FinanceSmsRateController {
    constructor(private readonly financeSmsRateService: FinanceSmsRateService) {}

    @ApiServiceDecorator(Post('create'), {
        windows: true,
        operation: { summary: '新增基础价格' },
        response: { status: 200, description: 'OK', type: windows.OmixPayloadResponse }
    })
    public async httpBaseFinanceCreateBasicSmsRate(@Request() request: OmixRequest, @Body() body: windows.CreateBasicSmsRateOptions) {
        return await this.financeSmsRateService.httpBaseFinanceCreateBasicSmsRate(request, body)
    }

    @ApiServiceDecorator(Post('update'), {
        windows: true,
        operation: { summary: '编辑基础价格' },
        response: { status: 200, description: 'OK', type: windows.OmixPayloadResponse }
    })
    public async httpBaseFinanceUpdateBasicSmsRate(@Request() request: OmixRequest, @Body() body: windows.UpdateBasicSmsRateOptions) {
        return await this.financeSmsRateService.httpBaseFinanceUpdateBasicSmsRate(request, body)
    }

    @ApiServiceDecorator(Post('column'), {
        windows: true,
        operation: { summary: '基础价格分页列表' },
        response: { status: 200, description: 'OK', type: windows.ColumnBasicSmsRateOptionsResponse }
    })
    public async httpBaseFinanceColumnBasicSmsRate(@Request() request: OmixRequest, @Body() body: windows.ColumnBasicSmsRateOptions) {
        return await this.financeSmsRateService.httpBaseFinanceColumnBasicSmsRate(request, body)
    }

    @ApiServiceDecorator(Post('update/status'), {
        windows: true,
        operation: { summary: '基础价格状态修改' },
        response: { status: 200, description: 'OK', type: windows.OmixPayloadResponse }
    })
    public async httpBaseFinanceUpdateBasicSmsRateStatus(@Request() request: OmixRequest, @Body() body: windows.UpdateBasicSmsRateStatusOptions) {
        return await this.financeSmsRateService.httpBaseFinanceUpdateBasicSmsRateStatus(request, body)
    }
}
