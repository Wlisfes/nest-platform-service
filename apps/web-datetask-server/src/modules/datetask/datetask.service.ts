import { Injectable, OnModuleInit } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { DataBaseService, WindowsService, enums } from '@/modules/database/database.service'
import { DATETASK_QUEUE } from '@web-datetask-server/modules/datetask/datetask.constants'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'
import { isNotEmpty, fetchIntNumber, fetchCloneByte } from '@/utils'
import { OmixRequest } from '@/interface'
import * as datetask from '@web-datetask-server/interface'

@Injectable()
export class DatetaskService extends Logger implements OnModuleInit {
    constructor(
        @InjectQueue(DATETASK_QUEUE) private readonly datetaskQueue: Queue,
        private readonly database: DataBaseService,
        private readonly windows: WindowsService
    ) {
        super()
    }

    /**应用启动时从数据库加载所有启用的任务，注册为 BullMQ repeatable jobs**/
    async onModuleInit() {
        await this.fetchLoadAndRegisterTasks()
    }

    /**从数据库加载任务并注册到 BullMQ**/
    @AutoDescriptor
    public async fetchLoadAndRegisterTasks() {
        /**清除所有现有的 repeatable jobs，防止重复**/
        await this.datetaskQueue.getJobSchedulers().then(async jobs => {
            for (const job of jobs) {
                await this.datetaskQueue.removeJobScheduler(job.key)
            }
            return jobs
        })
        /**查询所有启用的任务**/
        return await this.database.builder(this.windows.datetaskOptions, async qb => {
            qb.where(`t.status = :status`, { status: 'enable' })
            return await qb.getMany().then(async tasks => {
                for (const task of tasks) {
                    const jobData = { taskId: task.taskId, taskName: task.taskName, handler: task.handler, body: task.body }
                    if (task.runTime) {
                        /**一次性任务：计算延迟时间**/
                        // const delay = new Date(task.runTime).getTime() - Date.now()
                        // if (delay > 0) {
                        //     await this.datetaskQueue.add(task.handler, jobData, {
                        //         delay,
                        //         jobId: `task-${task.taskName}-once`
                        //     })
                        //     this.logger.info(`注册一次性任务: 任务名称-[${task.taskName}]，执行时间-[${task.runTime}]`)
                        // } else {
                        //     this.logger.info(`跳过已过期的一次性任务: 任务名称-[${task.taskName}]，执行时间-[${task.runTime}]`)
                        // }
                    } else if (task.cron) {
                        /**周期任务：使用 Cron 表达式**/
                        // await this.datetaskQueue.add(task.handler, jobData, {
                        //     repeat: { pattern: task.cron },
                        //     jobId: `task-${task.taskName}`
                        // })
                        // this.logger.info(`注册周期任务: 任务名称-[${task.taskName}]，Cron表达式-[${task.cron}]`)
                    }
                }
                this.logger.info(`共加载 ${tasks.length} 个定时任务`)
                return tasks
            })
        })
    }

    /**启用任务**/
    @AutoDescriptor
    public async fetchEnableTask(taskId: number) {
        const task = await this.windows.datetaskOptions.findOne({ where: { taskId } as any })
        if (!task) throw new Error(`任务不存在: ${taskId}`)

        await this.windows.datetaskOptions.update({ taskId } as any, { status: 'enable' } as any)
        await this.datetaskQueue.add(
            task.handler,
            { taskId: task.taskId, taskName: task.taskName, handler: task.handler, body: task.body },
            { repeat: { pattern: task.cron }, jobId: `task-${task.taskName}` }
        )
        this.logger.info(`启用任务: ${task.taskName}`)
        return task
    }

    /**停用任务**/
    @AutoDescriptor
    public async fetchDisableTask(taskId: number) {
        const task = await this.windows.datetaskOptions.findOne({ where: { taskId } as any })
        if (!task) throw new Error(`任务不存在: ${taskId}`)

        await this.windows.datetaskOptions.update({ taskId } as any, { status: 'disable' } as any)
        /**移除 repeatable job**/
        const repeatables = await this.datetaskQueue.getRepeatableJobs()
        const target = repeatables.find(r => r.name === task.handler)
        if (target) {
            await this.datetaskQueue.removeRepeatableByKey(target.key)
        }
        this.logger.info(`停用任务: ${task.taskName}`)
        return task
    }

    /**修改任务 Cron 表达式**/
    @AutoDescriptor
    public async fetchUpdateTaskCron(taskId: number, cron: string) {
        const task = await this.windows.datetaskOptions.findOne({ where: { taskId } as any })
        if (!task) throw new Error(`任务不存在: ${taskId}`)

        /**先移除旧的 repeatable job**/
        const repeatables = await this.datetaskQueue.getRepeatableJobs()
        const target = repeatables.find(r => r.name === task.handler)
        if (target) {
            await this.datetaskQueue.removeRepeatableByKey(target.key)
        }

        /**更新数据库**/
        await this.windows.datetaskOptions.update({ taskId } as any, { cron } as any)

        /**如果任务是启用状态，重新注册**/
        if (task.status === 'enable') {
            await this.datetaskQueue.add(
                task.handler,
                { taskId: task.taskId, taskName: task.taskName, handler: task.handler, body: task.body },
                { repeat: { pattern: cron }, jobId: `task-${task.taskName}` }
            )
        }
        this.logger.info(`更新任务Cron: ${task.taskName} => ${cron}`)
        return { ...task, cron }
    }

    /**手动触发一次任务**/
    @AutoDescriptor
    public async fetchTriggerTask(taskId: number) {
        const task = await this.windows.datetaskOptions.findOne({ where: { taskId } as any })
        if (!task) throw new Error(`任务不存在: ${taskId}`)

        await this.datetaskQueue.add(
            task.handler,
            { taskId: task.taskId, taskName: task.taskName, handler: task.handler, body: task.body, manual: true },
            { jobId: `task-${task.taskName}-manual-${Date.now()}` }
        )
        this.logger.info(`手动触发任务: ${task.taskName}`)
        return task
    }

    /**写入任务执行日志**/
    @AutoDescriptor
    public async fetchBaseWriteTaskLog(request: OmixRequest, body: datetask.BaseWriteTaskLogOptions) {
        await this.database.create(this.windows.datetaskLogOptions, {
            comment: `写入任务执行日志: 任务名称-${body.taskName}，任务处理器标识-${body.taskName}`,
            stack: this.stack,
            request,
            body: body
        })
        /**更新任务的上次执行时间**/
        return await this.database.update(this.windows.datetaskOptions, {
            request,
            where: { taskId: body.taskId },
            body: { lastTime: body.endTime }
        })
    }

    /**注册系统任务定义（不存在则自动创建）**/
    @AutoDescriptor
    public async fetchBaseEnsureSystemTask(request: OmixRequest, body: datetask.BaseEnsureSystemTaskOptions) {
        return await this.windows.datetaskOptions.findOne({ where: { taskName: body.taskName } }).then(async node => {
            if (isNotEmpty(node)) {
                this.logger.info(`任务已存在: 任务ID-[${node.taskId}]，任务名称-[${node.taskName}]，任务处理器标识-[${node.handler}]`)
                return node
            }
            return await fetchIntNumber().then(async taskId => {
                return await this.database.create(this.windows.datetaskOptions, {
                    comment: `自动创建任务: 任务ID-[${taskId}]，任务名称-[${body.taskName}]，任务处理器标识-[${body.handler}]`,
                    stack: this.stack,
                    request,
                    body: fetchCloneByte(body, {
                        taskId,
                        body: body.body ?? {},
                        status: body.status ?? enums.CHUNK_DATETASK_STATUS.enable.value
                    })
                })
            })
        })
    }
}
