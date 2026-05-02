import { Post, Body, Request } from '@nestjs/common'
import { FinanceSmsRateService } from '@web-windows-server/modules/finance/rates/sms/sms-rate.service'
import { ApifoxController, ApiServiceDecorator } from '@/decorator'
import { OmixRequest } from '@/interface'
import * as windows from '@web-windows-server/interface'

@ApifoxController('费率管理', 'finance/rates/sms')
export class FinanceSmsRateController {
    constructor(private readonly financeSmsRateService: FinanceSmsRateService) {}

    @ApiServiceDecorator(Post('create'), {
        windows: true,
        operation: { summary: '新增短信基础费率' },
        response: { status: 200, description: 'OK', type: windows.OmixPayloadResponse }
    })
    public async httpBaseFinanceCreateBasicSmsRate(@Request() request: OmixRequest, @Body() body: windows.CreateBasicSmsRateOptions) {
        return await this.financeSmsRateService.httpBaseFinanceCreateBasicSmsRate(request, body)
    }

    @ApiServiceDecorator(Post('update'), {
        windows: true,
        operation: { summary: '编辑短信基础费率' },
        response: { status: 200, description: 'OK', type: windows.OmixPayloadResponse }
    })
    public async httpBaseFinanceUpdateBasicSmsRate(@Request() request: OmixRequest, @Body() body: windows.UpdateBasicSmsRateOptions) {
        return await this.financeSmsRateService.httpBaseFinanceUpdateBasicSmsRate(request, body)
    }

    @ApiServiceDecorator(Post('column'), {
        windows: true,
        operation: { summary: '短信基础费率分页列表' },
        response: { status: 200, description: 'OK', type: windows.ColumnBasicSmsRateOptionsResponse }
    })
    public async httpBaseFinanceColumnBasicSmsRate(@Request() request: OmixRequest, @Body() body: windows.ColumnBasicSmsRateOptions) {
        return await this.financeSmsRateService.httpBaseFinanceColumnBasicSmsRate(request, body)
    }


}
