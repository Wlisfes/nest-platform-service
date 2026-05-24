import { Post, Body, Request } from '@nestjs/common'
import { DeployDatetaskService } from '@web-windows-server/modules/deploy/datetask/datetask.service'
import { ApifoxController, ApiServiceDecorator } from '@/decorator'
import { OmixRequest } from '@/interface'
import * as windows from '@web-windows-server/interface'

@ApifoxController('综合设置-定时任务管理', 'deploy/datetask')
export class DeployDatetaskController {
    constructor(private readonly deployDatetaskService: DeployDatetaskService) {}

    @ApiServiceDecorator(Post('column'), {
        windows: true,
        operation: { summary: '系统任务分页列表' },
        response: { status: 200, description: 'OK', type: windows.ColumnDatetaskOptionsResponse }
    })
    public async httpBaseSystemColumnDatetask(@Request() request: OmixRequest, @Body() body: windows.ColumnDatetaskOptions) {
        return await this.deployDatetaskService.httpBaseSystemColumnDatetask(request, body)
    }

    @ApiServiceDecorator(Post('status/update'), {
        windows: true,
        operation: { summary: '启用/停用任务' },
        response: { status: 200, description: 'OK', type: windows.OmixPayloadResponse }
    })
    public async httpBaseSystemUpdateDatetaskStatus(@Request() request: OmixRequest, @Body() body: windows.UpdateDatetaskStatusOptions) {
        return await this.deployDatetaskService.httpBaseSystemUpdateDatetaskStatus(request, body)
    }

    @ApiServiceDecorator(Post('cron/update'), {
        windows: true,
        operation: { summary: '修改Cron表达式' },
        response: { status: 200, description: 'OK', type: windows.OmixPayloadResponse }
    })
    public async httpBaseSystemUpdateDatetaskCron(@Request() request: OmixRequest, @Body() body: windows.UpdateDatetaskCronOptions) {
        return await this.deployDatetaskService.httpBaseSystemUpdateDatetaskCron(request, body)
    }

    @ApiServiceDecorator(Post('trigger'), {
        windows: true,
        operation: { summary: '手动触发任务' },
        response: { status: 200, description: 'OK', type: windows.OmixPayloadResponse }
    })
    public async httpBaseSystemTriggerDatetask(@Request() request: OmixRequest, @Body() body: windows.BaseSystemTriggerDatetaskOptions) {
        return await this.deployDatetaskService.httpBaseSystemTriggerDatetask(request, body)
    }

    @ApiServiceDecorator(Post('log/column'), {
        windows: true,
        operation: { summary: '任务执行日志' },
        response: { status: 200, description: 'OK', type: windows.ColumnDatetaskLogOptionsResponse }
    })
    public async httpBaseSystemColumnDatetaskLog(@Request() request: OmixRequest, @Body() body: windows.ColumnDatetaskLogOptions) {
        return await this.deployDatetaskService.httpBaseSystemColumnDatetaskLog(request, body)
    }
}
