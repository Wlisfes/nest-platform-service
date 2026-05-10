import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Injectable, Inject } from '@nestjs/common'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { WinstonService, AutoDescriptor } from '@/modules/logger/logger.service'
import { DATETASK_SYSTEM_QUEUE } from '@web-datetask-server/modules/datetask/datetask.constants'
import { DatetaskService } from '@web-datetask-server/modules/datetask/datetask.service'
import { ExchangeUtilsService } from '@web-datetask-server/modules/exchange/exchange.utils.service'
import { Logger } from 'winston'
import { Job } from 'bullmq'
import { OmixRequest } from '@/interface'
import * as datetask from '@web-datetask-server/interface'
import * as enums from '@/modules/database/enums'

/**系统任务处理器分发中心**/
@Processor(DATETASK_SYSTEM_QUEUE)
@Injectable()
export class DatetaskSystemProcessor extends WorkerHost {
    @Inject(WINSTON_MODULE_PROVIDER) protected readonly winston: Logger

    constructor(private readonly datetaskService: DatetaskService, private readonly exchangeUtilsService: ExchangeUtilsService) {
        super()
    }

    /**系统任务执行器**/
    @AutoDescriptor
    private async fetchBaseSystemTaskActuator(request: OmixRequest, jobData: datetask.BaseJobDatetaskOptions) {
        if (jobData.handler === this.exchangeUtilsService.taskName) {
            /**获取国际费率定时任务执行器**/
            return await this.exchangeUtilsService.fetchBaseRatesByFrankfurter(request, jobData)
        }
        throw new Error(`未注册的处理器: ${jobData.handler}`)
    }

    /**记录任务执行日志**/
    @AutoDescriptor
    private async fetchBaseWriteTaskExecution(request: OmixRequest, jobData: datetask.BaseJobDatetaskOptions, body: Omix) {
        const endTime = new Date()
        return await this.datetaskService.fetchBaseWriteTaskLog(request, {
            taskId: jobData.taskId,
            taskName: jobData.taskName,
            startTime: body.startTime,
            status: body.status,
            result: body.result,
            error: body.message,
            endTime: endTime,
            duration: endTime.getTime() - body.startTime.getTime()
        })
    }

    /**系统任务消费者**/
    async process(job: Job<datetask.BaseJobDatetaskOptions & { request: OmixRequest }>) {
        const startTime = new Date()
        const logger = new WinstonService(this.winston, job.data.request, {
            stack: `${DatetaskSystemProcessor.name}:process`,
            datetime: startTime.getTime()
        })
        try {
            return await this.fetchBaseSystemTaskActuator(job.data.request, job.data).then(async result => {
                await this.fetchBaseWriteTaskExecution(job.data.request, job.data, {
                    result,
                    startTime,
                    status: enums.CHUNK_DATETASK_LOG_STATUS.success.value
                })
                logger.info(
                    `系统任务处理成功：任务ID-[${job.data.taskId}]，任务名称-[${job.data.taskName}]，任务处理器标识-[${job.data.handler}]，Cron表达式-[${job.data.cron}]`
                )
                return true
            })
        } catch (err) {
            await this.fetchBaseWriteTaskExecution(job.data.request, job.data, {
                startTime,
                error: err.message,
                result: err.options ?? err.cause ?? {},
                status: enums.CHUNK_DATETASK_LOG_STATUS.failed.value
            })
            logger.info(
                `系统任务处理成功：任务ID-[${job.data.taskId}]，任务名称-[${job.data.taskName}]，任务处理器标识-[${job.data.handler}]，Cron表达式-[${job.data.cron}]`
            )
            throw err
        }
    }
}
