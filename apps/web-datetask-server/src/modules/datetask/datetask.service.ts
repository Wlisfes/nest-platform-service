import { Injectable, OnModuleInit } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { DataBaseService, WindowsService, enums } from '@/modules/database/database.service'
import { DATETASK_QUEUE } from '@web-datetask-server/modules/datetask/datetask.constants'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'
import { isNotEmpty, fetchIntNumber, fetchCloneByte } from '@/utils'
import { OmixRequest } from '@/interface'
import * as datetask from '@web-datetask-server/interface'

export interface DatetaskWriteLogOptions {
    taskId: number
    taskName: string
    startTime: Date
    endTime: Date
    duration: number
    status: string
    result?: string
    error?: string
}

export interface DatetaskEnsureTaskOptions {
    name: string
    title: string
    description?: string
    type: string
    cron: string
    handler: string
    status?: string
    params?: Record<string, any>
}

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
                /**逐个注册为 repeatable job**/
                for (const task of tasks) {
                    await this.datetaskQueue.add(
                        task.handler,
                        { taskId: task.keyId, taskName: task.name, handler: task.handler, params: task.params },
                        { repeat: { pattern: task.cron }, jobId: `task-${task.name}` }
                    )
                    this.logger.info(`注册任务: 任务名称-[${task.title}]，任务处理器标识-[${task.name}]，Cron表达式-[${task.cron}]`)
                }
                this.logger.info(`共加载 ${tasks.length} 个定时任务`)
                return tasks
            })
        })
    }

    /**启用任务**/
    @AutoDescriptor
    public async fetchEnableTask(taskId: number) {
        const task = await this.windows.datetaskOptions.findOne({ where: { keyId: taskId } as any })
        if (!task) throw new Error(`任务不存在: ${taskId}`)

        await this.windows.datetaskOptions.update(taskId, { status: 'enable' } as any)
        await this.datetaskQueue.add(
            task.handler,
            { taskId: task.keyId, taskName: task.name, handler: task.handler, params: task.params },
            { repeat: { pattern: task.cron }, jobId: `task-${task.name}` }
        )
        this.logger.info(`[DatetaskManager] 启用任务: ${task.title}`)
        return task
    }

    /**停用任务**/
    @AutoDescriptor
    public async fetchDisableTask(taskId: number) {
        const task = await this.windows.datetaskOptions.findOne({ where: { keyId: taskId } as any })
        if (!task) throw new Error(`任务不存在: ${taskId}`)

        await this.windows.datetaskOptions.update(taskId, { status: 'disable' } as any)
        /**移除 repeatable job**/
        const repeatables = await this.datetaskQueue.getRepeatableJobs()
        const target = repeatables.find(r => r.name === task.handler)
        if (target) {
            await this.datetaskQueue.removeRepeatableByKey(target.key)
        }
        this.logger.info(`[DatetaskManager] 停用任务: ${task.title}`)
        return task
    }

    /**修改任务 Cron 表达式**/
    @AutoDescriptor
    public async fetchUpdateTaskCron(taskId: number, cron: string) {
        const task = await this.windows.datetaskOptions.findOne({ where: { keyId: taskId } as any })
        if (!task) throw new Error(`任务不存在: ${taskId}`)

        /**先移除旧的 repeatable job**/
        const repeatables = await this.datetaskQueue.getRepeatableJobs()
        const target = repeatables.find(r => r.name === task.handler)
        if (target) {
            await this.datetaskQueue.removeRepeatableByKey(target.key)
        }

        /**更新数据库**/
        await this.windows.datetaskOptions.update(taskId, { cron } as any)

        /**如果任务是启用状态，重新注册**/
        if (task.status === 'enable') {
            await this.datetaskQueue.add(
                task.handler,
                { taskId: task.keyId, taskName: task.name, handler: task.handler, params: task.params },
                { repeat: { pattern: cron }, jobId: `task-${task.name}` }
            )
        }
        this.logger.info(`[DatetaskManager] 更新任务Cron: ${task.title} => ${cron}`)
        return { ...task, cron }
    }

    /**手动触发一次任务**/
    @AutoDescriptor
    public async fetchTriggerTask(taskId: number) {
        const task = await this.windows.datetaskOptions.findOne({ where: { keyId: taskId } as any })
        if (!task) throw new Error(`任务不存在: ${taskId}`)

        await this.datetaskQueue.add(
            task.handler,
            { taskId: task.keyId, taskName: task.name, handler: task.handler, params: task.params, manual: true },
            { jobId: `task-${task.name}-manual-${Date.now()}` }
        )
        this.logger.info(`[DatetaskManager] 手动触发任务: ${task.title}`)
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
        return await this.windows.datetaskOptions.findOne({ where: { name: body.name } }).then(async node => {
            if (isNotEmpty(node)) {
                this.logger.info(`任务已存在: 任务ID-[${node.taskId}]，任务名称-[${node.title}]，任务处理器标识-[${node.name}]`)
                return node
            }
            const taskId = fetchIntNumber({ sync: true })
            return await this.database.create(this.windows.datetaskOptions, {
                comment: `自动创建任务: 任务ID-[${taskId}]，任务名称-[${body.title}]，任务处理器标识-[${body.name}]`,
                stack: this.stack,
                request,
                body: fetchCloneByte(body, {
                    taskId,
                    status: body.status ?? enums.CHUNK_DATETASK_STATUS.enable.value,
                    params: body.params ?? {}
                })
            })
        })
    }
}
