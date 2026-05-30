import { Post, Body, Request } from '@nestjs/common'
import { SmsSaturationService } from '@web-windows-server/modules/crm/saturation/sms/sms-saturation.service'
import { ApifoxController, ApiServiceDecorator } from '@/decorator'
import { OmixRequest } from '@/interface'
import * as windows from '@web-windows-server/interface'

@ApifoxController('销售管理-报价查询', 'crm/saturation/sms')
export class SmsSaturationController {
    constructor(private readonly smsSaturationService: SmsSaturationService) {}

    @ApiServiceDecorator(Post('/column'), {
        windows: true,
        operation: { summary: '报价分页列表查询' },
        response: { status: 200, description: 'OK', type: windows.SmsSaturationColumnOptionsResponse }
    })
    public async httpSmsSaturationColumn(@Request() request: OmixRequest, @Body() body: windows.SmsSaturationColumnOptions) {
        return await this.smsSaturationService.httpSmsSaturationColumn(request, body)
    }
}
