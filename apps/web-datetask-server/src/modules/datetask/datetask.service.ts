import { Injectable } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { DataBaseService, WindowsService, enums, schema } from '@/modules/database/database.service'
import { DatetaskSystemService } from '@web-datetask-server/modules/datetask/datetask-system.service'
import { isNotEmpty, pick, fetchIntNumber, fetchCloneByte } from '@/utils'
import { OmixRequest } from '@/interface'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'
import * as constants from '@web-datetask-server/modules/datetask/datetask.constants'
import * as datetask from '@web-datetask-server/interface'

@Injectable()
export class DatetaskService extends Logger {
    /**系统任务队列标识符**/
    private readonly systemTasks: Array<string> = [constants.DATETASK_SYSTEM_QUEUE]
    constructor(
        @InjectQueue(constants.DATETASK_SYSTEM_QUEUE) private readonly systemQueue: Queue,
        @InjectQueue(constants.DATETASK_SMS_OTP_QUEUE) private readonly smsOtpQueue: Queue,
        @InjectQueue(constants.DATETASK_SMS_COMMON_QUEUE) private readonly smsCommonQueue: Queue,
        private readonly database: DataBaseService,
        private readonly windows: WindowsService,
        private readonly datetaskSystemService: DatetaskSystemService
    ) {
        super()
    }

    /**复制任务数据，避免污染原对象**/
    private fetchCloneByteTaskOptions(task: Partial<schema.WindowsDatetask>, request?: Omix) {
        return fetchCloneByte(
            { request },
            pick(task, ['taskId', 'taskName', 'handler', 'type', 'cron', 'runTime', 'status', 'body', 'comment'])
        )
    }

    /**清除所有job任务防止重复**/
    private async fetchRemoveJobScheduler(queue: Queue) {
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
    private async fetchRemoveByTaskIdJobScheduler(queue: Queue, taskId: string) {
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

    /**注册短信任务**/
    // @AutoDescriptor
    // public async fetchTaskSmsRegister(request: OmixRequest, task: Partial<schema.WindowsDatetask>) {
    //     const delay = Math.max(new Date(task.runTime).getTime() - Date.now(), 0)
    //     await this.datetaskSmsQueue.add(constants.DATETASK_SMS_COMMON_QUEUE, this.fetchCloneByteTaskOptions(task, request), {
    //         delay,
    //         jobId: task.taskId
    //     })
    //     return this.logger.info(
    //         `注册短信任务: 任务ID-[${task.taskId}]，任务名称-[${task.taskName}]，任务处理器标识-[${task.handler}]，执行时间-[${task.runTime}]`
    //     )
    // }

    /**从数据库加载任务并注册到 BullMQ**/
    @AutoDescriptor
    public async fetchTasksRegister(request?: OmixRequest) {
        const jobs = [
            this.fetchRemoveJobScheduler(this.systemQueue),
            this.fetchRemoveJobScheduler(this.smsOtpQueue),
            this.fetchRemoveJobScheduler(this.smsCommonQueue)
        ]
        return await Promise.all(jobs).then(async () => {
            return await this.fetchLoadAndRegisterTasks(request)
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

    /**从数据库加载任务并注册到 BullMQ**/
    @AutoDescriptor
    public async fetchLoadAndRegisterTasks(request?: OmixRequest) {
        /**查询所有启用的任务**/
        return await this.database.builder(this.windows.datetaskOptions, async qb => {
            qb.where(
                `(t.status IN (:...status) AND t.type = :system AND t.cron IS NOT NULL) OR (t.status IN (:...status) AND t.type = :sms AND t.runTime IS NOT NULL)`,
                {
                    status: [enums.CHUNK_DATETASK_STATUS.running.value, enums.CHUNK_DATETASK_STATUS.wait.value],
                    system: enums.CHUNK_DATETASK_TYPE.system.value,
                    sms: enums.CHUNK_DATETASK_TYPE.sms.value
                }
            )
            return await qb.getMany().then(async tasks => {
                for (const task of tasks) {
                    /**系统任务：使用 Cron 表达式**/
                    if (task.type === enums.CHUNK_DATETASK_TYPE.system.value) {
                        await this.datetaskSystemService.fetchTaskSystemRegister(request, task)
                    }
                    /**短信任务：计算延迟时间**/
                    // if (task.type === enums.CHUNK_DATETASK_TYPE.sms.value) {
                    //     await this.fetchTaskSmsRegister(request, task)
                    // }
                }
                const systemTasks = tasks.filter(task => task.type === enums.CHUNK_DATETASK_TYPE.system.value && task.cron && !task.runTime)
                const businessTasks = tasks.length - systemTasks.length
                return this.logger.info(
                    `共加载 ${tasks.length} 个定时任务，系统任务: ${systemTasks.length} 个，业务任务: ${businessTasks} 个`
                )
            })
        })
    }

    /**启用任务**/
    @AutoDescriptor
    public async fetchBaseEnableSystemTask(request: Omix, payload: datetask.BaseEnableSystemTaskOptions) {
        return await this.database.builder(this.windows.datetaskOptions, async qb => {
            qb.where('t.taskId = :taskId AND t.type = :system', { taskId: payload.taskId, system: enums.CHUNK_DATETASK_TYPE.system.value })
            return await qb.getOne().then(async task => {
                /**更新数据库状态为运行中**/
                await this.database.update(this.windows.datetaskOptions, {
                    logger: false,
                    request: request as OmixRequest,
                    where: { taskId: payload.taskId },
                    body: { status: enums.CHUNK_DATETASK_STATUS.running.value }
                })
                /**注册 Cron 定时任务到队列**/
                await this.systemQueue.add(constants.DATETASK_SYSTEM_QUEUE, this.fetchCloneByteTaskOptions(task, request), {
                    repeat: { pattern: task.cron, key: task.taskId }
                })
                this.logger.info(
                    `启用系统任务: 任务ID-[${task.taskId}]，任务名称-[${task.taskName}]，任务处理器标识-[${task.handler}]，Cron表达式-[${task.cron}]`
                )
                return await this.fetchResolver({ message: '启用系统任务成功' })
            })
        })
    }

    /**停用任务**/
    @AutoDescriptor
    public async fetchBaseDisableSystemTask(request: Omix, payload: datetask.BaseDisableSystemTaskOptions) {
        return await this.database.builder(this.windows.datetaskOptions, async qb => {
            qb.where('t.taskId = :taskId AND t.type = :system', { taskId: payload.taskId, system: enums.CHUNK_DATETASK_TYPE.system.value })
            return await qb.getOne().then(async task => {
                /**更新数据库状态为停止**/
                await this.database.update(this.windows.datetaskOptions, {
                    logger: false,
                    request: request as OmixRequest,
                    where: { taskId: payload.taskId },
                    body: { status: enums.CHUNK_DATETASK_STATUS.stop.value }
                })
                /**精确移除该任务的 job scheduler**/
                await this.fetchRemoveByTaskIdJobScheduler(this.systemQueue, task.taskId)
                this.logger.info(`停用系统任务: 任务ID-[${task.taskId}]，任务名称-[${task.taskName}]，任务处理器标识-[${task.handler}]`)
                return await this.fetchResolver({ message: '停用系统任务成功' })
            })
        })
    }

    /**修改任务 Cron 表达式**/
    @AutoDescriptor
    public async fetchBaseUpdateSystemTaskCron(request: Omix, payload: datetask.BaseUpdateSystemTaskCronOptions) {
        return await this.database.builder(this.windows.datetaskOptions, async qb => {
            qb.where('t.taskId = :taskId AND t.type = :system', { taskId: payload.taskId, system: enums.CHUNK_DATETASK_TYPE.system.value })
            return await qb.getOne().then(async task => {
                /**更新数据库 Cron 表达式**/
                await this.database.update(this.windows.datetaskOptions, {
                    logger: false,
                    request: request as OmixRequest,
                    where: { taskId: payload.taskId },
                    body: { cron: payload.cron }
                })
                /**如果任务是运行中状态，移除旧的并重新注册该任务**/
                if (task.status === enums.CHUNK_DATETASK_STATUS.running.value) {
                    await this.fetchRemoveByTaskIdJobScheduler(this.systemQueue, payload.taskId)
                    await this.systemQueue.add(constants.DATETASK_SYSTEM_QUEUE, this.fetchCloneByteTaskOptions(task, request), {
                        repeat: { pattern: payload.cron, key: payload.taskId }
                    })
                }
                this.logger.info(
                    `修改系统任务Cron: 任务ID-[${task.taskId}]，任务名称-[${task.taskName}]，Cron表达式-[${task.cron}] => [${payload.cron}]`
                )
                return await this.fetchResolver({ message: '修改Cron表达式成功' })
            })
        })
    }

    /**手动触发一次系统任务**/
    @AutoDescriptor
    public async fetchBaseTriggerSystemTask(request: Omix, payload: datetask.BaseTriggerTaskOptions) {
        return await this.database.builder(this.windows.datetaskOptions, async qb => {
            qb.where('t.taskId = :taskId AND t.type = :system', { taskId: payload.taskId, system: enums.CHUNK_DATETASK_TYPE.system.value })
            return await qb.getOne().then(async task => {
                const taskOptions = this.fetchCloneByteTaskOptions(task, request)
                await this.systemQueue.add(constants.DATETASK_SYSTEM_QUEUE, taskOptions, { lifo: true })
                this.logger.info(`手动触发系统任务: 任务ID-[${task.taskId}]，任务名称-[${task.taskName}]，任务处理器标识-[${task.handler}]`)
                return await this.fetchResolver({ message: '手动触发系统任务成功' })
            })
        })
    }
}
