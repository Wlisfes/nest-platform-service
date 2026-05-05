import { Controller } from '@nestjs/common'
import { MessagePattern } from '@nestjs/microservices'
import { DatetaskService } from '@web-datetask-server/modules/datetask/datetask.service'
import { OmixRequest } from '@/interface'
import * as datetask from '@web-datetask-server/interface'

@Controller()
export class DatetaskController {
    constructor(private readonly datetaskService: DatetaskService) {}

    /**手动触发一次系统任务**/
    @MessagePattern({ cmd: 'fetchBaseTriggerSystemTask' })
    public async fetchBaseTriggerSystemTask(payload: { request: OmixRequest } & datetask.BaseTriggerTaskOptions) {
        return await this.datetaskService.fetchBaseTriggerSystemTask(payload)
    }
}
