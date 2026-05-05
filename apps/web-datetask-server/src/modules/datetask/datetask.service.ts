import { Injectable, Scope, Inject } from '@nestjs/common'
import { CONTEXT, RequestContext } from '@nestjs/microservices'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { DataBaseService, WindowsService, enums, schema } from '@/modules/database/database.service'
import { isNotEmpty, pick, fetchIntNumber, fetchCloneByte } from '@/utils'
import { OmixRequest } from '@/interface'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'
import * as constants from '@web-datetask-server/modules/datetask/datetask.constants'
import * as datetask from '@web-datetask-server/interface'

@Injectable({ scope: Scope.REQUEST })
export class DatetaskService extends Logger {
    constructor(
        @InjectQueue(constants.DATETASK_SMS_QUEUE) private readonly datetaskSmsQueue: Queue,
        @InjectQueue(constants.DATETASK_SYSTEM_QUEUE) private readonly datetaskSystemQueue: Queue,
        private readonly database: DataBaseService,
        private readonly windows: WindowsService
    ) {
        super()
    }

    /**清除job任务防止重复**/
    private async fetchRemoveJobScheduler(queue: Queue) {
        return await queue.getJobSchedulers().then(async jobs => {
            for (const job of jobs) {
                await queue.removeJobScheduler(job.key)
            }
            return jobs
        })
    }

    /**复制任务数据，避免污染原对象**/
    private fetchCloneByteTaskOptions(task: Partial<schema.WindowsDatetask>, request?: Omix) {
        return fetchCloneByte(
            { request },
            pick(task, ['taskId', 'taskName', 'handler', 'type', 'cron', 'runTime', 'status', 'body', 'comment'])
        )
    }

    /**从数据库加载任务并注册到 BullMQ**/
    @AutoDescriptor
    public async fetchTasksRegister(request?: OmixRequest) {
        const jobs = [this.fetchRemoveJobScheduler(this.datetaskSystemQueue)]
        return await Promise.all(jobs).then(async () => {
            return await this.fetchLoadAndRegisterTasks(request)
        })
    }

    /**从数据库加载任务并注册到 BullMQ**/
    @AutoDescriptor
    public async fetchLoadAndRegisterTasks(request?: OmixRequest) {
        /**查询所有启用的任务**/
        return await this.database.builder(this.windows.datetaskOptions, async qb => {
            qb.where(
                `(t.status = :status AND t.type = :system AND t.cron IS NOT NULL) OR (t.status = :status AND t.type = :sms AND t.runTime IS NOT NULL)`,
                {
                    status: enums.CHUNK_DATETASK_STATUS.running.value,
                    system: enums.CHUNK_DATETASK_TYPE.system.value,
                    sms: enums.CHUNK_DATETASK_TYPE.sms.value
                }
            )
            return await qb.getMany().then(async tasks => {
                for (const task of tasks) {
                    if (task.type === enums.CHUNK_DATETASK_TYPE.system.value) {
                        /**系统任务：使用 Cron 表达式**/
                        await this.datetaskSystemQueue.add(constants.DATETASK_SYSTEM_QUEUE, this.fetchCloneByteTaskOptions(task, request), {
                            repeat: { pattern: task.cron }
                        })
                        this.logger.info(
                            `注册系统任务: 任务ID-[${task.taskId}]，任务名称-[${task.taskName}]，任务处理器标识-[${task.handler}]，Cron表达式-[${task.cron}]`
                        )
                    }

                    // if (taskOptions.type === enums.CHUNK_DATETASK_TYPE.sms.value) {
                    //     /**短信任务：计算延迟时间**/
                    //     const delay = Math.max(new Date(task.runTime).getTime() - Date.now(), 0)
                    //     // await this.datetaskSmsQueue.add(taskOptions, { delay, jobId: task.taskId })
                    //     this.logger.info(
                    //         `注册短信任务: 任务ID-[${task.taskId}]，任务名称-[${task.taskName}]，任务处理器标识-[${task.handler}]，执行时间-[${task.runTime}]`
                    //     )
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
    public async fetchEnableTask(taskId: number) {
        // const task = await this.windows.datetaskOptions.findOne({ where: { taskId } as any })
        // if (!task) throw new Error(`任务不存在: ${taskId}`)
        // await this.windows.datetaskOptions.update({ taskId } as any, { status: 'enable' } as any)
        // await this.datetaskQueue.add(
        //     task.handler,
        //     { taskId: task.taskId, taskName: task.taskName, handler: task.handler, body: task.body },
        //     { repeat: { pattern: task.cron }, jobId: `task-${task.taskName}` }
        // )
        // this.logger.info(`启用任务: ${task.taskName}`)
        // return task
    }

    /**停用任务**/
    @AutoDescriptor
    public async fetchDisableTask(taskId: number) {
        // const task = await this.windows.datetaskOptions.findOne({ where: { taskId } as any })
        // if (!task) throw new Error(`任务不存在: ${taskId}`)
        // await this.windows.datetaskOptions.update({ taskId } as any, { status: 'disable' } as any)
        // /**移除 repeatable job**/
        // const repeatables = await this.datetaskQueue.getRepeatableJobs()
        // const target = repeatables.find(r => r.name === task.handler)
        // if (target) {
        //     await this.datetaskQueue.removeRepeatableByKey(target.key)
        // }
        // this.logger.info(`停用任务: ${task.taskName}`)
        // return task
    }

    /**修改任务 Cron 表达式**/
    @AutoDescriptor
    public async fetchUpdateTaskCron(taskId: number, cron: string) {
        const task = await this.windows.datetaskOptions.findOne({ where: { taskId } as any })
        if (!task) throw new Error(`任务不存在: ${taskId}`)

        /**先移除旧的 repeatable job**/
        // const repeatables = await this.datetaskQueue.getRepeatableJobs()
        // const target = repeatables.find(r => r.name === task.handler)
        // if (target) {
        //     await this.datetaskQueue.removeRepeatableByKey(target.key)
        // }

        // /**更新数据库**/
        // await this.windows.datetaskOptions.update({ taskId } as any, { cron } as any)

        // /**如果任务是启用状态，重新注册**/
        // if (task.status === 'enable') {
        //     await this.datetaskQueue.add(
        //         task.handler,
        //         { taskId: task.taskId, taskName: task.taskName, handler: task.handler, body: task.body },
        //         { repeat: { pattern: cron }, jobId: `task-${task.taskName}` }
        //     )
        // }
        this.logger.info(`更新任务Cron: ${task.taskName} => ${cron}`)
        return { ...task, cron }
    }

    /**手动触发一次系统任务**/
    @AutoDescriptor
    public async fetchBaseTriggerSystemTask(request: Omix, payload: datetask.BaseTriggerTaskOptions) {
        return await this.database.builder(this.windows.datetaskOptions, async qb => {
            qb.where('t.taskId = :taskId AND t.type = :system', { taskId: payload.taskId, system: enums.CHUNK_DATETASK_TYPE.system.value })
            return await qb.getOne().then(async task => {
                const taskOptions = this.fetchCloneByteTaskOptions(task, request)
                await this.datetaskSystemQueue.add(constants.DATETASK_SYSTEM_QUEUE, taskOptions, { lifo: true })
                this.logger.info(`手动触发系统任务: 任务ID-[${task.taskId}]，任务名称-[${task.taskName}]，任务处理器标识-[${task.handler}]`)
                return await this.fetchResolver({ message: '手动触发系统任务成功' })
            })
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

    /**注册系统任务定义（不存在则自动创建）**/
    @AutoDescriptor
    public async fetchBaseEnsureSystemTask(request: OmixRequest, body: datetask.BaseEnsureSystemTaskOptions) {
        const whereOptions: Omix = { taskName: body.taskName, type: enums.CHUNK_DATETASK_TYPE.system.value }
        return await this.windows.datetaskOptions.findOne({ where: whereOptions }).then(async task => {
            if (isNotEmpty(task)) {
                this.logger.info(
                    `系统任务已存在: 任务ID-[${task.taskId}]，任务名称-[${task.taskName}]，任务处理器标识-[${task.handler}]，Cron表达式-[${task.cron}]`
                )
                return task
            }
            return await fetchIntNumber().then(async taskId => {
                return await this.database.create(this.windows.datetaskOptions, {
                    comment: `自动创建任务: 任务ID-[${taskId}]，任务名称-[${body.taskName}]，任务处理器标识-[${body.handler}]`,
                    stack: this.stack,
                    request,
                    body: fetchCloneByte(body, {
                        taskId,
                        body: body.body ?? {},
                        status: enums.CHUNK_DATETASK_STATUS.running.value
                    })
                })
            })
        })
    }
}
