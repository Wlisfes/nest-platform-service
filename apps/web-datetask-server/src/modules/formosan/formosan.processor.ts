import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Injectable, Inject } from '@nestjs/common'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { WinstonService } from '@/modules/logger/logger.service'
import { SmsService, enums } from '@/modules/database/database.service'
import { DATETASK_FORMOSAN_QUEUE } from '@web-datetask-server/modules/datetask/datetask.constants'
import { Logger } from 'winston'
import { Job } from 'bullmq'
import { OmixRequest } from '@/interface'

@Processor(DATETASK_FORMOSAN_QUEUE)
@Injectable()
export class FormosanProcessor extends WorkerHost {
    @Inject(WINSTON_MODULE_PROVIDER) protected readonly winston: Logger

    constructor(private readonly smsService: SmsService) {
        super()
    }

    /**任务消费者：到达 effectiveTime 后将报价状态更新为已生效**/
    async process(job: Job<{ keyId: number; clientId: number; appId: string; code: string; handler: string; request: OmixRequest }>) {
        const startTime = new Date()
        const logger = new WinstonService(this.winston, job.data.request, {
            stack: `${FormosanProcessor.name}:process`,
            datetime: startTime.getTime()
        })
        try {
            /**更新报价状态为已生效**/
            await this.smsService.tbSmsAppFormosanOptions.update(
                { keyId: job.data.keyId },
                { status: enums.CHUNK_SMS_FORMOSAN_STATUS.effective.value }
            )
            logger.info(
                `报价生效成功：keyId-[${job.data.keyId}]，客户-[${job.data.clientId}]，应用-[${job.data.appId}]，国家-[${job.data.code}]`
            )
            return true
        } catch (err) {
            logger.error(
                `报价生效失败：keyId-[${job.data.keyId}]，客户-[${job.data.clientId}]，应用-[${job.data.appId}]，错误-[${err.message}]`
            )
            throw err
        }
    }
}
