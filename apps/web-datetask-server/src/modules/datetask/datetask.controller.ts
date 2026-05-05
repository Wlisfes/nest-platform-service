import { Controller } from '@nestjs/common'
import { MessagePattern } from '@nestjs/microservices'
import { DatetaskService } from '@web-datetask-server/modules/datetask/datetask.service'
import { OmixRequest } from '@/interface'
import * as datetask from '@web-datetask-server/interface'

@Controller()
export class DatetaskController {
    constructor(private readonly datetaskService: DatetaskService) {}

    /**启用系统任务**/
    @MessagePattern({ cmd: 'fetchBaseEnableSystemTask' })
    public async fetchBaseEnableSystemTask(payload: { request: OmixRequest } & datetask.BaseEnableSystemTaskOptions) {
        return await this.datetaskService.fetchBaseEnableSystemTask(payload.request, payload)
    }

    /**停用系统任务**/
    @MessagePattern({ cmd: 'fetchBaseDisableSystemTask' })
    public async fetchBaseDisableSystemTask(payload: { request: OmixRequest } & datetask.BaseDisableSystemTaskOptions) {
        return await this.datetaskService.fetchBaseDisableSystemTask(payload.request, payload)
    }

    /**修改系统任务Cron表达式**/
    @MessagePattern({ cmd: 'fetchBaseUpdateSystemTaskCron' })
    public async fetchBaseUpdateSystemTaskCron(payload: { request: OmixRequest } & datetask.BaseUpdateSystemTaskCronOptions) {
        return await this.datetaskService.fetchBaseUpdateSystemTaskCron(payload.request, payload)
    }

    /**手动触发一次系统任务**/
    @MessagePattern({ cmd: 'fetchBaseTriggerSystemTask' })
    public async fetchBaseTriggerSystemTask(payload: { request: OmixRequest } & datetask.BaseTriggerTaskOptions) {
        return await this.datetaskService.fetchBaseTriggerSystemTask(payload.request, payload)
    }
}
