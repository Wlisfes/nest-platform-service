import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Injectable, Inject } from '@nestjs/common'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { WinstonService } from '@/modules/logger/logger.service'
import { Logger } from 'winston'
import { Job } from 'bullmq'
import { isEmpty } from '@/utils'
import { OmixRequest } from '@/interface'
import { DATETASK_SYSTEM_QUEUE } from '@web-datetask-server/modules/datetask/datetask.constants'
import { DatetaskService } from '@web-datetask-server/modules/datetask/datetask.service'
import * as datetask from '@web-datetask-server/interface'
import * as enums from '@/modules/database/enums'

/**系统任务处理器分发中心**/
@Processor(DATETASK_SYSTEM_QUEUE)
@Injectable()
export class DatetaskSystemProcessor extends WorkerHost {
    @Inject(WINSTON_MODULE_PROVIDER) protected readonly winston: Logger
    /**处理器注册表**/
    private handlers = new Map<string, datetask.TaskHandler>()
    constructor(private readonly datetaskService: DatetaskService) {
        super()
    }

    /**注册处理器**/
    public async fetchRegisterHandler(name: string, handler: datetask.TaskHandler) {
        return this.handlers.set(name, handler)
    }

    /**BullMQ Worker 入口**/
    async process(job: Job<datetask.BaseJobDatetaskOptions & { request: OmixRequest }>) {
        const date = new Date()
        const logger = new WinstonService(this.winston, job.data.request, {
            stack: `${DatetaskSystemProcessor.name}:process`,
            datetime: date.getTime()
        })
        try {
            const handler = this.handlers.get(job.data.handler)
            if (isEmpty(handler)) {
                throw new Error(`未注册的处理器: ${job.data.handler}`)
            }
            return await handler(job.data).then(async data => {
                const endTime = new Date()
                await this.datetaskService.fetchBaseWriteTaskLog(job.data.request, {
                    taskId: job.data.taskId,
                    taskName: job.data.taskName,
                    startTime: date,
                    endTime: endTime,
                    duration: endTime.getTime() - date.getTime(),
                    status: enums.CHUNK_DATETASK_LOG_STATUS.success.value,
                    result: data ?? {}
                })
                logger.info(
                    `系统任务处理成功：任务ID-[${job.data.taskId}]，任务名称-[${job.data.taskName}]，任务处理器标识-[${job.data.handler}]，Cron表达式-[${job.data.cron}]`
                )
                return true
            })
        } catch (err) {
            const endTime = new Date()
            await this.datetaskService.fetchBaseWriteTaskLog(job.data.request, {
                taskId: job.data.taskId,
                taskName: job.data.taskName,
                startTime: date,
                endTime: endTime,
                duration: endTime.getTime() - date.getTime(),
                status: enums.CHUNK_DATETASK_LOG_STATUS.failed.value,
                result: err.options ?? err.cause ?? {},
                error: err.message
            })
            logger.error(
                `系统任务处理失败：任务ID-[${job.data.taskId}]，任务名称-[${job.data.taskName}]，任务处理器标识-[${job.data.handler}]，Cron表达式-[${job.data.cron}]，错误信息-[${err.message}]`
            )
            throw err
        }
    }
}
