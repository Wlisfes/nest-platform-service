import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { DataBaseService, WindowsService, enums } from '@/modules/database/database.service'
import { isNotEmpty, fetchClientSender } from '@/utils'
import { OmixRequest } from '@/interface'
import * as windows from '@web-windows-server/interface'

@Injectable()
export class DeployDatetaskService extends Logger {
    constructor(
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
                    qb.andWhere(`t.taskName LIKE :taskName`, { taskName: `%${body.taskName}%` })
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
        try {
            /**验证任务存在**/
            const task = await this.database.empty(this.windows.datetaskOptions, {
                request,
                message: '系统任务:不存在',
                dispatch: {
                    where: { type: enums.CHUNK_DATETASK_TYPE.system.value, taskId: body.taskId }
                }
            })
            /**根据目标状态调用不同的微服务方法**/
            if (body.status === enums.CHUNK_DATETASK_STATUS.running.value) {
                return await fetchClientSender(this.datetaskServer, {
                    pattern: { cmd: 'fetchBaseEnableSystemTask' },
                    data: {
                        taskId: body.taskId,
                        request: { logId: request.logId, datetime: request.datetime }
                    }
                })
            } else {
                return await fetchClientSender(this.datetaskServer, {
                    pattern: { cmd: 'fetchBaseDisableSystemTask' },
                    data: {
                        taskId: body.taskId,
                        request: { logId: request.logId, datetime: request.datetime }
                    }
                })
            }
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        }
    }

    /**修改Cron表达式**/
    @AutoDescriptor
    public async httpBaseSystemUpdateDatetaskCron(request: OmixRequest, body: windows.UpdateDatetaskCronOptions) {
        try {
            /**验证任务存在**/
            await this.database.empty(this.windows.datetaskOptions, {
                request,
                message: '系统任务:不存在',
                dispatch: {
                    where: { type: enums.CHUNK_DATETASK_TYPE.system.value, taskId: body.taskId }
                }
            })
            return await fetchClientSender(this.datetaskServer, {
                pattern: { cmd: 'fetchBaseUpdateSystemTaskCron' },
                data: {
                    taskId: body.taskId,
                    cron: body.cron,
                    request: { logId: request.logId, datetime: request.datetime }
                }
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
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
