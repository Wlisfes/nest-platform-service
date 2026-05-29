import { Injectable } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { DataBaseService, WindowsService, enums } from '@/modules/database/database.service'
import { DatetaskQueueService } from '@web-datetask-server/modules/datetask/datetask.queue.service'
import { DatetaskUtilsService } from '@web-datetask-server/modules/datetask/datetask.utils.service'
import { SystemService } from '@web-datetask-server/modules/system/system.service'
import { OmixRequest } from '@/interface'

@Injectable()
export class DatetaskService extends Logger {
    constructor(
        private readonly database: DataBaseService,
        private readonly windows: WindowsService,
        private readonly queueService: DatetaskQueueService,
        private readonly utilsService: DatetaskUtilsService,
        private readonly systemService: SystemService
    ) {
        super()
    }

    /**从数据库加载任务并注册到 BullMQ**/
    @AutoDescriptor
    public async fetchTasksRegister(request?: OmixRequest) {
        const jobs = [this.utilsService.fetchRemoveJobScheduler(this.queueService.systemQueue)]
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
                        await this.systemService.fetchTaskSystemRegister(request, task)
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
