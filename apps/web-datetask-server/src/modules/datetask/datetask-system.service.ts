import { Injectable } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { DataBaseService, WindowsService, enums, schema } from '@/modules/database/database.service'
import { isNotEmpty, pick, fetchIntNumber, fetchCloneByte } from '@/utils'
import { OmixRequest } from '@/interface'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'
import * as constants from '@web-datetask-server/modules/datetask/datetask.constants'
import * as datetask from '@web-datetask-server/interface'

@Injectable()
export class DatetaskSystemService extends Logger {
    constructor(
        @InjectQueue(constants.DATETASK_SYSTEM_QUEUE) private readonly systemQueue: Queue,
        private readonly database: DataBaseService,
        private readonly windows: WindowsService
    ) {
        super()
    }

    /**注册系统任务**/
    @AutoDescriptor
    public async fetchTaskSystemRegister(request: OmixRequest, task: Partial<schema.WindowsDatetask>) {
        await this.systemQueue.add(constants.DATETASK_SYSTEM_QUEUE, fetchCloneByte({ request }, task), {
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
                await this.systemQueue.add(constants.DATETASK_SYSTEM_QUEUE, fetchCloneByte({ request }, task), { lifo: true })
                this.logger.info(`手动触发系统任务: 任务ID-[${task.taskId}]，任务名称-[${task.taskName}]，任务处理器标识-[${task.handler}]`)
                return await this.fetchResolver({ message: '手动触发系统任务成功' })
            })
        })
    }
}
