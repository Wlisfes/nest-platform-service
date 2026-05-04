import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { Job } from 'bullmq'
import { DATETASK_QUEUE } from '@web-datetask-server/modules/datetask/datetask.constants'
import { DatetaskService } from '@web-datetask-server/modules/datetask/datetask.service'
import * as datetask from '@web-datetask-server/interface'

/**处理器注册表类型**/
export type TaskHandler = (params: Record<string, Omix>) => Promise<Omix>

/**任务处理器分发中心**/
@Processor(DATETASK_QUEUE)
@Injectable()
export class DatetaskProcessor extends WorkerHost {
    /**处理器注册表**/
    private handlers = new Map<string, TaskHandler>()

    constructor(private readonly datetaskService: DatetaskService) {
        super()
    }

    /**注册处理器**/
    public async fetchRegisterHandler(name: string, handler: TaskHandler) {
        return this.handlers.set(name, handler)
    }

    /**BullMQ Worker 入口**/
    async process(job: Job<datetask.BaseJobDatetaskOptions>) {
        const { taskId, taskName, handler } = job.data

        console.log('job.data', job.data)

        return job.data
        // const startTime = new Date()
        // try {
        //     const handlerFn = this.handlers.get(handler)
        //     if (!handlerFn) {
        //         throw new Error(`未注册的处理器: ${handler}`)
        //     }
        //     const result = await handlerFn(params ?? {})
        //     const endTime = new Date()
        //     const duration = endTime.getTime() - startTime.getTime()

        //     console.log('result', result, 'duration', duration)

        //     /**写入成功日志**/
        //     // await this.datetaskService.fetchWriteLog(undefined, {
        //     //     taskId,
        //     //     taskName,
        //     //     startTime,
        //     //     endTime,
        //     //     duration,
        //     //     status: 'success',
        //     //     result: JSON.stringify(result)
        //     // })
        //     return result
        // } catch (err) {
        //     const endTime = new Date()
        //     const duration = endTime.getTime() - startTime.getTime()

        //     /**写入失败日志**/
        //     // await this.datetaskService.fetchWriteLog(undefined, {
        //     //     taskId,
        //     //     taskName,
        //     //     startTime,
        //     //     endTime,
        //     //     duration,
        //     //     status: 'failed',
        //     //     error: err.message
        //     // })
        //     throw err
        // }
    }
}
