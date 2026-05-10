import { Injectable } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { DataBaseService, WindowsService, enums } from '@/modules/database/database.service'
import { DatetaskUtilsService } from '@web-datetask-server/modules/datetask/datetask.utils.service'
import { DatetaskSystemService } from '@web-datetask-server/modules/datetask/datetask-system.service'
import { OmixRequest } from '@/interface'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'
import * as constants from '@web-datetask-server/modules/datetask/datetask.constants'

@Injectable()
export class DatetaskService extends Logger {
    constructor(
        @InjectQueue(constants.DATETASK_SYSTEM_QUEUE) private readonly systemQueue: Queue,
        @InjectQueue(constants.DATETASK_SMS_QUEUE) private readonly smsQueue: Queue,
        private readonly database: DataBaseService,
        private readonly windows: WindowsService,
        private readonly datetaskUtilsService: DatetaskUtilsService,
        private readonly datetaskSystemService: DatetaskSystemService
    ) {
        super()
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
            this.datetaskUtilsService.fetchRemoveJobScheduler(this.systemQueue),
            this.datetaskUtilsService.fetchRemoveJobScheduler(this.smsQueue)
        ]
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
                `(t.status IN (:...status) AND t.type = :system AND t.cron IS NOT NULL) OR (t.status IN (:...status) AND t.type = :sms AND t.runTime IS NOT NULL)`,
                {
                    status: [enums.CHUNK_DATETASK_STATUS.running.value, enums.CHUNK_DATETASK_STATUS.wait.value],
                    system: enums.CHUNK_DATETASK_TYPE.system.value,
                    sms: enums.CHUNK_DATETASK_TYPE.sms.value
                }
            )
            await this.database.selection(qb, [
                ['t', ['taskId', 'taskName', 'handler', 'type', 'cron', 'runTime', 'status', 'body', 'comment']]
            ])
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
}
