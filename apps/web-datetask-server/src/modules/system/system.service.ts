import { Injectable } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { DataBaseService, WindowsService, enums, schema } from '@/modules/database/database.service'
import { DatetaskQueueService } from '@web-datetask-server/modules/datetask/datetask.queue.service'
import { DatetaskUtilsService } from '@web-datetask-server/modules/datetask/datetask.utils.service'
import { isNotEmpty, fetchIntNumber, fetchCloneByte } from '@/utils'
import { OmixRequest } from '@/interface'
import * as constants from '@web-datetask-server/modules/datetask/datetask.constants'
import * as datetask from '@web-datetask-server/interface'

@Injectable()
export class SystemService extends Logger {
    constructor(
        private readonly database: DataBaseService,
        private readonly windows: WindowsService,
        private readonly queueService: DatetaskQueueService,
        private readonly utilsService: DatetaskUtilsService
    ) {
        super()
    }

    /**注册系统任务**/
    @AutoDescriptor
    public async fetchTaskSystemRegister(request: OmixRequest, task: Partial<schema.WindowsDatetask>) {
        await this.queueService.systemQueue.add(constants.DATETASK_SYSTEM_QUEUE, fetchCloneByte({ request }, task), {
            repeat: { pattern: task.cron, key: task.taskId }
        })
        return this.logger.info(
            `注册系统任务: 任务ID-[${task.taskId}]，任务名称-[${task.taskName}]，任务处理器标识-[${task.handler}]，Cron表达式-[${task.cron}]`
        )
    }

    /**注册系统任务定义**/
    @AutoDescriptor
    public async fetchBaseEnsureSystemTask(request: OmixRequest, body: datetask.BaseEnsureSystemTaskOptions) {
        const whereOptions: Omix = { handler: body.handler, type: enums.CHUNK_DATETASK_TYPE.system.value }
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

    /**手动触发一次系统任务**/
    @AutoDescriptor
    public async fetchBaseTriggerSystemTask(request: Omix, payload: datetask.BaseTriggerTaskOptions) {
        return await this.database.builder(this.windows.datetaskOptions, async qb => {
            qb.where('t.taskId = :taskId AND t.type = :system', { taskId: payload.taskId, system: enums.CHUNK_DATETASK_TYPE.system.value })
            await this.database.selection(qb, [
                ['t', ['taskId', 'taskName', 'handler', 'type', 'cron', 'runTime', 'status', 'body', 'comment']]
            ])
            return await qb.getOne().then(async task => {
                await this.queueService.systemQueue.add(constants.DATETASK_SYSTEM_QUEUE, fetchCloneByte({ request }, task), { lifo: true })
                this.logger.info(`手动触发系统任务: 任务ID-[${task.taskId}]，任务名称-[${task.taskName}]，任务处理器标识-[${task.handler}]`)
                return await this.fetchResolver({ message: '手动触发系统任务成功' })
            })
        })
    }

    /**启动系统任务**/
    @AutoDescriptor
    public async fetchBaseEnableSystemTask(request: Omix, payload: datetask.BaseEnableSystemTaskOptions) {
        return await this.database.builder(this.windows.datetaskOptions, async qb => {
            qb.where('t.taskId = :taskId AND t.type = :system', { taskId: payload.taskId, system: enums.CHUNK_DATETASK_TYPE.system.value })
            await this.database.selection(qb, [
                ['t', ['taskId', 'taskName', 'handler', 'type', 'cron', 'runTime', 'status', 'body', 'comment']]
            ])
            return await qb.getOne().then(async task => {
                /**更新数据库状态为运行中**/
                await this.database.update(this.windows.datetaskOptions, {
                    logger: false,
                    request: request as OmixRequest,
                    where: { taskId: payload.taskId },
                    body: { status: enums.CHUNK_DATETASK_STATUS.running.value }
                })
                /**注册 Cron 定时任务到队列**/
                await this.queueService.systemQueue.add(constants.DATETASK_SYSTEM_QUEUE, fetchCloneByte({ request }, task), {
                    repeat: { pattern: task.cron, key: task.taskId }
                })
                this.logger.info(
                    `启用系统任务: 任务ID-[${task.taskId}]，任务名称-[${task.taskName}]，任务处理器标识-[${task.handler}]，Cron表达式-[${task.cron}]`
                )
                return await this.fetchResolver({ message: '启用系统任务成功' })
            })
        })
    }

    /**停止系统任务**/
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
                await this.utilsService.fetchRemoveByTaskIdJobScheduler(this.queueService.systemQueue, task.taskId)
                this.logger.info(`停用系统任务: 任务ID-[${task.taskId}]，任务名称-[${task.taskName}]，任务处理器标识-[${task.handler}]`)
                return await this.fetchResolver({ message: '停用系统任务成功' })
            })
        })
    }

    /**修改系统任务Cron表达式**/
    @AutoDescriptor
    public async fetchBaseUpdateSystemTaskCron(request: Omix, payload: datetask.BaseUpdateSystemTaskCronOptions) {
        return await this.database.builder(this.windows.datetaskOptions, async qb => {
            qb.where('t.taskId = :taskId AND t.type = :system', { taskId: payload.taskId, system: enums.CHUNK_DATETASK_TYPE.system.value })
            await this.database.selection(qb, [
                ['t', ['taskId', 'taskName', 'handler', 'type', 'cron', 'runTime', 'status', 'body', 'comment']]
            ])
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
                    await this.utilsService.fetchRemoveByTaskIdJobScheduler(this.queueService.systemQueue, payload.taskId)
                    await this.queueService.systemQueue.add(constants.DATETASK_SYSTEM_QUEUE, fetchCloneByte({ request }, task), {
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
}
