import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { Job } from 'bullmq'
import { DATETASK_QUEUE } from '@web-datetask-server/modules/datetask/datetask.constants'
import { DatetaskManagerService } from '@web-datetask-server/modules/datetask/datetask.service'

/**处理器注册表类型**/
export type TaskHandler = (params: Record<string, any>) => Promise<any>

/**任务处理器分发中心**/
@Processor(DATETASK_QUEUE)
@Injectable()
export class DatetaskProcessor extends WorkerHost {
    /**处理器注册表**/
    private handlers = new Map<string, TaskHandler>()

    constructor(private readonly datetaskManager: DatetaskManagerService) {
        super()
    }

    /**注册处理器**/
    public registerHandler(name: string, handler: TaskHandler) {
        this.handlers.set(name, handler)
    }

    /**BullMQ Worker 入口**/
    async process(job: Job<{ taskId: number; taskName: string; handler: string; params: Record<string, any>; manual?: boolean }>) {
        const { taskId, taskName, handler, params } = job.data
        const startTime = new Date()
        try {
            const handlerFn = this.handlers.get(handler)
            if (!handlerFn) {
                throw new Error(`未注册的处理器: ${handler}`)
            }

            const result = await handlerFn(params ?? {})
            const endTime = new Date()
            const duration = endTime.getTime() - startTime.getTime()

            /**写入成功日志**/
            await this.datetaskManager.writeLog({
                taskId,
                taskName,
                startTime,
                endTime,
                duration,
                status: 'success',
                result: JSON.stringify(result)
            })

            return result
        } catch (err) {
            const endTime = new Date()
            const duration = endTime.getTime() - startTime.getTime()

            /**写入失败日志**/
            await this.datetaskManager.writeLog({
                taskId,
                taskName,
                startTime,
                endTime,
                duration,
                status: 'failed',
                error: err.message
            })

            throw err
        }
    }
}
