import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bullmq'
import { ClientProxy } from '@nestjs/microservices'
import { Queue } from 'bullmq'
import { firstValueFrom } from 'rxjs'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { DataBaseService, WindowsService, schema, enums } from '@/modules/database/database.service'
import { isNotEmpty, fetchClientSender } from '@/utils'
import { OmixRequest } from '@/interface'
import * as windows from '@web-windows-server/interface'

/**BullMQ 队列名称（与 web-datetask-server 共享）**/
const DATETASK_QUEUE = 'datetask-queue'

@Injectable()
export class DeployDatetaskService extends Logger {
    constructor(
        @InjectQueue(DATETASK_QUEUE) private readonly datetaskQueue: Queue,
        @Inject('web-datetask-server') private readonly datetaskServer: ClientProxy,
        private readonly database: DataBaseService,
        private readonly windows: WindowsService
    ) {
        super()
    }

    /**系统任务分页列表**/
    @AutoDescriptor
    public async httpBaseSystemColumnDatetask(request: OmixRequest, body: windows.ColumnDatetaskOptions) {
        try {
            return await this.database.builder(this.windows.datetaskOptions, async qb => {
                if (isNotEmpty(body.taskName)) {
                    qb.andWhere(`t.name LIKE :name`, { name: `%${body.taskName}%` })
                }
                if (isNotEmpty(body.status)) {
                    qb.andWhere(`t.status = :status`, { status: body.status })
                }
                if (isNotEmpty(body.type)) {
                    qb.andWhere(`t.type = :type`, { type: body.type })
                }
                qb.orderBy('t.createTime', 'DESC')
                qb.skip((body.page - 1) * body.size)
                qb.take(body.size)
                return await qb.getManyAndCount().then(async ([list, total]) => {
                    return await this.fetchResolver({ page: body.page, size: body.size, total, list })
                })
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        }
    }

    /**启用/停用任务**/
    @AutoDescriptor
    public async httpBaseSystemUpdateDatetaskStatus(request: OmixRequest, body: windows.UpdateDatetaskStatusOptions) {
        const ctx = await this.database.transaction()
        try {
            /**验证任务存在**/
            const task = await this.database.builder(this.windows.datetaskOptions, async qb => {
                qb.where(`t.keyId = :keyId`, { keyId: body.keyId })
                return await qb.getOne()
            })
            if (!task) {
                throw new HttpException('任务不存在', HttpStatus.BAD_REQUEST)
            }

            /**更新数据库状态**/
            await this.database.update(ctx.manager.getRepository(schema.WindowsDatetask), {
                request,
                stack: this.stack,
                where: { keyId: body.keyId },
                body: { status: body.status }
            })

            // if (body.status === 'enable') {
            //     /**启用：注册 repeatable job**/
            //     await this.datetaskQueue.add(
            //         task.handler,
            //         { taskId: task.keyId, taskName: task.name, handler: task.handler, params: task.params },
            //         { repeat: { pattern: task.cron }, jobId: `task-${task.name}` }
            //     )
            // } else {
            //     /**停用：移除 repeatable job**/
            //     const repeatables = await this.datetaskQueue.getRepeatableJobs()
            //     const target = repeatables.find(r => r.name === task.handler)
            //     if (target) {
            //         await this.datetaskQueue.removeRepeatableByKey(target.key)
            //     }
            // }

            return await ctx.commitTransaction().then(async () => {
                return await this.fetchResolver({ message: '操作成功' })
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        } finally {
            await ctx.release()
        }
    }

    /**修改Cron表达式**/
    @AutoDescriptor
    public async httpBaseSystemUpdateDatetaskCron(request: OmixRequest, body: windows.UpdateDatetaskCronOptions) {
        const ctx = await this.database.transaction()
        try {
            /**验证任务存在**/
            const task = await this.database.builder(this.windows.datetaskOptions, async qb => {
                qb.where(`t.keyId = :keyId`, { keyId: body.keyId })
                return await qb.getOne()
            })
            if (!task) {
                throw new HttpException('任务不存在', HttpStatus.BAD_REQUEST)
            }

            /**先移除旧的 repeatable job**/
            const repeatables = await this.datetaskQueue.getRepeatableJobs()
            const target = repeatables.find(r => r.name === task.handler)
            if (target) {
                await this.datetaskQueue.removeRepeatableByKey(target.key)
            }

            /**更新数据库**/
            await this.database.update(ctx.manager.getRepository(schema.WindowsDatetask), {
                request,
                stack: this.stack,
                where: { keyId: body.keyId },
                body: { cron: body.cron }
            })

            /**如果任务是启用状态，重新注册**/
            // if (task.status === 'enable') {
            //     await this.datetaskQueue.add(
            //         task.handler,
            //         { taskId: task.keyId, taskName: task.name, handler: task.handler, params: task.params },
            //         { repeat: { pattern: body.cron }, jobId: `task-${task.name}` }
            //     )
            // }

            return await ctx.commitTransaction().then(async () => {
                return await this.fetchResolver({ message: '操作成功' })
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        } finally {
            await ctx.release()
        }
    }

    /**手动触发系统任务**/
    @AutoDescriptor
    public async httpBaseSystemTriggerDatetask(request: OmixRequest, body: windows.BaseSystemTriggerDatetaskOptions) {
        try {
            await this.database.empty(this.windows.datetaskOptions, {
                request,
                message: '系统任务ID:不存在',
                dispatch: {
                    where: { type: enums.CHUNK_DATETASK_TYPE.system.value, taskId: body.taskId }
                }
            })
            return await fetchClientSender(this.datetaskServer, {
                pattern: { cmd: 'fetchBaseTriggerSystemTask' },
                data: {
                    taskId: body.taskId,
                    request: { logId: request.logId, datetime: request.datetime }
                }
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        }
    }

    /**任务执行日志分页**/
    @AutoDescriptor
    public async httpBaseSystemColumnDatetaskLog(request: OmixRequest, body: windows.ColumnDatetaskLogOptions) {
        try {
            return await this.database.builder(this.windows.datetaskLogOptions, async qb => {
                qb.where(`t.taskId = :taskId`, { taskId: body.taskId })
                if (isNotEmpty(body.status)) {
                    qb.andWhere(`t.status = :status`, { status: body.status })
                }
                qb.orderBy('t.createTime', 'DESC')
                qb.skip((body.page - 1) * body.size)
                qb.take(body.size)
                return await qb.getManyAndCount().then(async ([list, total]) => {
                    return await this.fetchResolver({ page: body.page, size: body.size, total, list })
                })
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        }
    }
}
