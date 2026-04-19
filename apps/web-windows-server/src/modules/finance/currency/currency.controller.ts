import { Post, Body, Request } from '@nestjs/common'
import { FinanceCurrencyService } from '@web-windows-server/modules/finance/currency/currency.service'
import { ApifoxController, ApiServiceDecorator } from '@/decorator'
import { OmixRequest } from '@/interface'
import * as windows from '@web-windows-server/interface'

@ApifoxController('币种管理', 'finance/currency')
export class FinanceCurrencyController {
    constructor(private readonly financeCurrencyService: FinanceCurrencyService) {}

    @ApiServiceDecorator(Post('column'), {
        windows: true,
        operation: { summary: '币种分页列表' },
        response: { status: 200, description: 'OK', type: windows.ColumnCurrencyOptionsResponse }
    })
    public async httpBaseFinanceColumnCurrency(@Request() request: OmixRequest, @Body() body: windows.ColumnCurrencyOptions) {
        return await this.financeCurrencyService.httpBaseFinanceColumnCurrency(request, body)
    }

    @ApiServiceDecorator(Post('update/status'), {
        windows: true,
        operation: { summary: '币种状态修改' },
        response: { status: 200, description: 'OK', type: windows.OmixPayloadResponse }
    })
    public async httpBaseFinanceUpdateCurrencyStatus(@Request() request: OmixRequest, @Body() body: windows.UpdateCurrencyStatusOptions) {
        return await this.financeCurrencyService.httpBaseFinanceUpdateCurrencyStatus(request, body)
    }

    @ApiServiceDecorator(Post('select'), {
        windows: true,
        operation: { summary: '币种下拉列表' },
        response: { status: 200, description: 'OK', type: windows.SelectCurrencyOptionsResponse }
    })
    public async httpBaseFinanceSelectCurrency(@Request() request: OmixRequest) {
        return await this.financeCurrencyService.httpBaseFinanceSelectCurrency(request)
    }
}
