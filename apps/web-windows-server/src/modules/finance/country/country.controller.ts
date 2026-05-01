import { Post, Body, Request } from '@nestjs/common'
import { FinanceCountryService } from '@web-windows-server/modules/finance/country/country.service'
import { ApifoxController, ApiServiceDecorator } from '@/decorator'
import { OmixRequest } from '@/interface'
import * as windows from '@web-windows-server/interface'

@ApifoxController('国家/地区管理', 'finance/country')
export class FinanceCountryController {
    constructor(private readonly financeCountryService: FinanceCountryService) {}

    @ApiServiceDecorator(Post('column'), {
        windows: true,
        operation: { summary: '国家/地区分页列表' },
        response: { status: 200, description: 'OK', type: windows.ColumnCountryOptionsResponse }
    })
    public async httpBaseFinanceColumnCountry(@Request() request: OmixRequest, @Body() body: windows.ColumnCountryOptions) {
        return await this.financeCountryService.httpBaseFinanceColumnCountry(request, body)
    }

    @ApiServiceDecorator(Post('update/status'), {
        windows: true,
        operation: { summary: '国家/地区状态修改' },
        response: { status: 200, description: 'OK', type: windows.OmixPayloadResponse }
    })
    public async httpBaseFinanceUpdateCountryStatus(@Request() request: OmixRequest, @Body() body: windows.UpdateCountryStatusOptions) {
        return await this.financeCountryService.httpBaseFinanceUpdateCountryStatus(request, body)
    }

    @ApiServiceDecorator(Post('select'), {
        windows: true,
        operation: { summary: '国家/地区下拉列表' },
        response: { status: 200, description: 'OK', type: windows.SelectCountryOptionsResponse }
    })
    public async httpBaseFinanceSelectCountry(@Request() request: OmixRequest) {
        return await this.financeCountryService.httpBaseFinanceSelectCountry(request)
    }
}
