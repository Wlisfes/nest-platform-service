import { Post, Body, Request } from '@nestjs/common'
import { SmsFormosanService } from '@web-windows-server/modules/crm/formosan/sms/sms-formosan.service'
import { ApifoxController, ApiServiceDecorator } from '@/decorator'
import { OmixRequest } from '@/interface'
import * as windows from '@web-windows-server/interface'

@ApifoxController('销售管理-短信报价', 'crm/formosan/sms')
export class SmsFormosanController {
    constructor(private readonly smsFormosanService: SmsFormosanService) {}

    @ApiServiceDecorator(Post('/draft/init'), {
        windows: true,
        operation: { summary: '初始化报价草稿' },
        response: { status: 200, description: 'OK', type: windows.OmixPayloadResponse }
    })
    public async httpSmsFormosanDraftInit(@Request() request: OmixRequest, @Body() body: windows.SmsFormosanDraftInitOptions) {
        return await this.smsFormosanService.httpSmsFormosanDraftInit(request, body)
    }

    @ApiServiceDecorator(Post('/draft/column'), {
        windows: true,
        operation: { summary: '报价草稿列表' },
        response: { status: 200, description: 'OK', type: windows.SmsFormosanDraftColumnOptionsResponse }
    })
    public async httpSmsFormosanDraftColumn(@Request() request: OmixRequest, @Body() body: windows.SmsFormosanDraftColumnOptions) {
        return await this.smsFormosanService.httpSmsFormosanDraftColumn(request, body)
    }

    @ApiServiceDecorator(Post('/draft/update'), {
        windows: true,
        operation: { summary: '修改报价草稿' },
        response: { status: 200, description: 'OK', type: windows.OmixPayloadResponse }
    })
    public async httpSmsFormosanDraftUpdate(@Request() request: OmixRequest, @Body() body: windows.SmsFormosanDraftUpdateOptions) {
        return await this.smsFormosanService.httpSmsFormosanDraftUpdate(request, body)
    }

    @ApiServiceDecorator(Post('/draft/delete'), {
        windows: true,
        operation: { summary: '删除报价草稿' },
        response: { status: 200, description: 'OK', type: windows.OmixPayloadResponse }
    })
    public async httpSmsFormosanDraftDelete(@Request() request: OmixRequest, @Body() body: windows.SmsFormosanDraftDeleteOptions) {
        return await this.smsFormosanService.httpSmsFormosanDraftDelete(request, body)
    }

    @ApiServiceDecorator(Post('/preview'), {
        windows: true,
        operation: { summary: '预览报价' },
        response: { status: 200, description: 'OK', type: windows.SmsFormosanPreviewOptionsResponse }
    })
    public async httpSmsFormosanPreview(@Request() request: OmixRequest, @Body() body: windows.SmsFormosanPreviewOptions) {
        return await this.smsFormosanService.httpSmsFormosanPreview(request, body)
    }

    @ApiServiceDecorator(Post('/publish'), {
        windows: true,
        operation: { summary: '发布报价' },
        response: { status: 200, description: 'OK', type: windows.OmixPayloadResponse }
    })
    public async httpSmsFormosanPublish(@Request() request: OmixRequest, @Body() body: windows.SmsFormosanPublishOptions) {
        return await this.smsFormosanService.httpSmsFormosanPublish(request, body)
    }
}
