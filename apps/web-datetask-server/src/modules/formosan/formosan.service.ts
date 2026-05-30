import { Injectable } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { DataBaseService, SmsService, enums, schema } from '@/modules/database/database.service'
import { DatetaskQueueService } from '@web-datetask-server/modules/datetask/datetask.queue.service'
import { fetchCloneByte } from '@/utils'
import { OmixRequest } from '@/interface'
import * as constants from '@web-datetask-server/modules/datetask/datetask.constants'

@Injectable()
export class FormosanService extends Logger {
    /**任务处理器标识**/
    public readonly taskName: string = 'datetask-formosan-service'

    constructor(
        private readonly database: DataBaseService,
        private readonly smsService: SmsService,
        private readonly queueService: DatetaskQueueService
    ) {
        super()
    }

    /**注册报价任务：写入正式表 + 注册延迟任务**/
    @AutoDescriptor
    public async fetchBaseFormosanTaskRegister(request: OmixRequest, payload: Omix) {
        const { items, clientId, appId } = payload
        const results = []
        for (const item of items) {
            /**写入 TbSmsAppFormosan 正式表，状态为待生效**/
            const formosan = await this.smsService.tbSmsAppFormosanOptions.save({
                clientId: item.clientId,
                appId: item.appId,
                code: item.code,
                mcc: item.mcc,
                upUsd: item.upUsd,
                downUsd: item.downUsd,
                effectiveTime: item.effectiveTime,
                expiryTime: item.expiryTime,
                status: enums.CHUNK_SMS_FORMOSAN_STATUS.pending.value,
                remark: item.remark
            })
            /**计算延迟时间（毫秒）**/
            const effectiveDate = new Date(item.effectiveTime)
            const delay = Math.max(effectiveDate.getTime() - Date.now(), 0)
            /**注册延迟任务到 formosanQueue**/
            await this.queueService.formosanQueue.add(
                constants.DATETASK_FORMOSAN_QUEUE,
                fetchCloneByte({ request }, {
                    keyId: formosan.keyId,
                    clientId: item.clientId,
                    appId: item.appId,
                    code: item.code,
                    handler: this.taskName
                }),
                {
                    delay,
                    jobId: `formosan-${formosan.keyId}`
                }
            )
            this.logger.info(
                `注册报价任务: keyId-[${formosan.keyId}]，客户-[${item.clientId}]，应用-[${item.appId}]，国家-[${item.code}]，延迟-[${delay}ms]`
            )
            results.push(formosan)
        }
        return { message: `成功注册 ${results.length} 个报价任务`, count: results.length }
    }
}
