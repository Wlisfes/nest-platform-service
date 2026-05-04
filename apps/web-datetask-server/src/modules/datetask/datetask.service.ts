import { Injectable, OnModuleInit } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { DataBaseService, WindowsService } from '@/modules/database/database.service'
import { DATETASK_QUEUE } from '@web-datetask-server/modules/datetask/datetask.constants'

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
export class DatetaskManagerService extends Logger implements OnModuleInit {
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
        const existingRepeatables = await this.datetaskQueue.getRepeatableJobs()
        for (const job of existingRepeatables) {
            await this.datetaskQueue.removeRepeatableByKey(job.key)
        }

        /**查询所有启用的任务**/
        const tasks = await this.database.builder(this.windows.datetaskDefineOptions, async qb => {
            qb.where(`t.status = :status`, { status: 'enable' })
            return await qb.getMany()
        })

        /**逐个注册为 repeatable job**/
        for (const task of tasks) {
            await this.datetaskQueue.add(
                task.handler,
                { taskId: task.keyId, taskName: task.name, handler: task.handler, params: task.params },
                { repeat: { pattern: task.cron }, jobId: `task-${task.name}` }
            )
            this.logger.info(`[DatetaskManager] 注册任务: ${task.title} (${task.cron})`)
        }

        this.logger.info(`[DatetaskManager] 共加载 ${tasks.length} 个定时任务`)
    }

    /**启用任务**/
    @AutoDescriptor
    public async fetchEnableTask(taskId: number) {
        const task = await this.windows.datetaskDefineOptions.findOne({ where: { keyId: taskId } as any })
        if (!task) throw new Error(`任务不存在: ${taskId}`)

        await this.windows.datetaskDefineOptions.update(taskId, { status: 'enable' } as any)
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
        const task = await this.windows.datetaskDefineOptions.findOne({ where: { keyId: taskId } as any })
        if (!task) throw new Error(`任务不存在: ${taskId}`)

        await this.windows.datetaskDefineOptions.update(taskId, { status: 'disable' } as any)
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
        const task = await this.windows.datetaskDefineOptions.findOne({ where: { keyId: taskId } as any })
        if (!task) throw new Error(`任务不存在: ${taskId}`)

        /**先移除旧的 repeatable job**/
        const repeatables = await this.datetaskQueue.getRepeatableJobs()
        const target = repeatables.find(r => r.name === task.handler)
        if (target) {
            await this.datetaskQueue.removeRepeatableByKey(target.key)
        }

        /**更新数据库**/
        await this.windows.datetaskDefineOptions.update(taskId, { cron } as any)

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
        const task = await this.windows.datetaskDefineOptions.findOne({ where: { keyId: taskId } as any })
        if (!task) throw new Error(`任务不存在: ${taskId}`)

        await this.datetaskQueue.add(
            task.handler,
            { taskId: task.keyId, taskName: task.name, handler: task.handler, params: task.params, manual: true },
            { jobId: `task-${task.name}-manual-${Date.now()}` }
        )
        this.logger.info(`[DatetaskManager] 手动触发任务: ${task.title}`)
        return task
    }

    /**写入执行日志**/
    @AutoDescriptor
    public async fetchWriteLog(data: DatetaskWriteLogOptions) {
        const log = this.windows.datetaskLogOptions.create({
            taskId: data.taskId,
            taskName: data.taskName,
            startTime: data.startTime,
            endTime: data.endTime,
            duration: data.duration,
            status: data.status,
            result: data.result,
            error: data.error
        })
        await this.windows.datetaskLogOptions.save(log)

        /**更新任务的上次执行时间**/
        await this.windows.datetaskDefineOptions.update(data.taskId, { lastTime: data.endTime } as any)
    }

    /**确保任务定义存在（不存在则自动创建）**/
    @AutoDescriptor
    public async fetchEnsureTask(data: DatetaskEnsureTaskOptions) {
        const exist = await this.windows.datetaskDefineOptions.findOne({ where: { name: data.name } as any })
        if (exist) {
            this.logger.info(`[DatetaskManager] 任务已存在: ${data.title} (${data.name})`)
            return exist
        }
        const task = this.windows.datetaskDefineOptions.create({
            name: data.name,
            title: data.title,
            description: data.description ?? '',
            type: data.type,
            cron: data.cron,
            handler: data.handler,
            status: data.status ?? 'enable',
            params: data.params ?? {}
        })
        await this.windows.datetaskDefineOptions.save(task)
        this.logger.info(`[DatetaskManager] 自动创建任务: ${data.title} (${data.name})`)
        return task
    }
}
