import { Injectable } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { DataBaseService, WindowsService } from '@/modules/database/database.service'
import { isNotEmpty } from '@/utils'
import { OmixRequest } from '@/interface'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'
import * as constants from '@web-datetask-server/modules/datetask/datetask.constants'
import * as datetask from '@web-datetask-server/interface'

@Injectable()
export class DatetaskUtilsService extends Logger {
    /**系统任务队列标识符**/
    private readonly systemTasks: Array<string> = [constants.DATETASK_SYSTEM_QUEUE]
    constructor(
        @InjectQueue(constants.DATETASK_SYSTEM_QUEUE) private readonly systemQueue: Queue,
        private readonly database: DataBaseService,
        private readonly windows: WindowsService
    ) {
        super()
    }

    /**清除所有job任务防止重复**/
    public async fetchRemoveJobScheduler(queue: Queue) {
        if (this.systemTasks.includes(queue.name)) {
            /**系统任务：清除所有 cron job scheduler**/
            return await queue.getJobSchedulers().then(async jobs => {
                return await Promise.all(jobs.map(job => queue.removeJobScheduler(job.key)))
            })
        }
        /**一次性任务：清除所有 delayed job**/
        return await queue.getDelayed().then(async jobs => {
            return await Promise.all(jobs.map(job => job.remove()))
        })
    }

    /**根据 taskId 精确移除单个job任务**/
    public async fetchRemoveByTaskIdJobScheduler(queue: Queue, taskId: string) {
        if (this.systemTasks.includes(queue.name)) {
            /**系统任务：精确移除 cron job scheduler**/
            return await queue.getJobSchedulers().then(async jobs => {
                const job = jobs.find(s => s.key === taskId)
                if (isNotEmpty(job)) {
                    await queue.removeJobScheduler(job.key)
                }
                return job
            })
        }
        /**一次性任务：通过 jobId 精确移除 delayed job**/
        return await queue.getJob(taskId).then(async job => {
            if (isNotEmpty(job)) {
                await job.remove()
            }
            return job
        })
    }

    /**写入任务执行日志**/
    @AutoDescriptor
    public async fetchBaseWriteTaskLog(request: OmixRequest, body: datetask.BaseWriteTaskLogOptions) {
        await this.database.create(this.windows.datetaskLogOptions, {
            logger: false,
            stack: this.stack,
            request,
            body: body
        })
        /**更新任务的上次执行时间**/
        await this.database.update(this.windows.datetaskOptions, {
            logger: false,
            request,
            where: { taskId: body.taskId },
            body: { lastTime: body.endTime }
        })
        return this.logger.info(`写入任务执行日志: 任务ID-[${body.taskId}]，任务名称-[${body.taskName}]`)
    }
}
