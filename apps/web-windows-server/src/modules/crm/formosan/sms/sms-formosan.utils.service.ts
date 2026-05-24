import { Injectable } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { DataBaseService, SmsService } from '@/modules/database/database.service'
import { isNotEmpty } from '@/utils'
import { OmixRequest } from '@/interface'
import * as windows from '@web-windows-server/interface'

@Injectable()
export class SmsFormosanUtilsService extends Logger {
    constructor(private readonly database: DataBaseService, private readonly smsService: SmsService) {
        super()
    }

    /**根据keyId查询报价信息**/
    @AutoDescriptor
    public async fetchUtilsByKeyIdFormosan(request: OmixRequest, body: Omix<{ keyId: number }>) {
        return await this.database.empty(this.smsService.tbSmsAppFormosanOptions, {
            request,
            message: 'keyId:不存在',
            dispatch: { where: { keyId: body.keyId } }
        })
    }

    /**批量查询报价**/
    @AutoDescriptor
    public async fetchUtilsByColumnFormosan(request: OmixRequest, body: windows.UtilsByColumnFormosanOptions) {
        if (body.keyIds.length === 0) {
            return []
        }
        return await this.database.builder(this.smsService.tbSmsAppFormosanOptions, async qb => {
            if (body.fields && body.fields.length > 0) {
                qb.select([...new Set(['t.keyId', ...body.fields.map(f => `t.${f}`)])])
            }
            qb.where(`t.keyId IN (:...keyIds)`, { keyIds: [...new Set(body.keyIds.filter(isNotEmpty))] })
            return await qb.getMany()
        })
    }

    /**根据keyId查询报价草稿信息**/
    @AutoDescriptor
    public async fetchUtilsByKeyIdFormosanDraft(request: OmixRequest, body: Omix<{ keyId: number }>) {
        return await this.database.empty(this.smsService.tbSmsAppFormosanDraftOptions, {
            request,
            message: 'keyId:不存在',
            dispatch: { where: { keyId: body.keyId } }
        })
    }

    /**批量查询报价草稿**/
    @AutoDescriptor
    public async fetchUtilsByColumnFormosanDraft(request: OmixRequest, body: windows.UtilsByColumnFormosanDraftOptions) {
        if (body.keyIds.length === 0) {
            return []
        }
        return await this.database.builder(this.smsService.tbSmsAppFormosanDraftOptions, async qb => {
            if (body.fields && body.fields.length > 0) {
                qb.select([...new Set(['t.keyId', ...body.fields.map(f => `t.${f}`)])])
            }
            qb.where(`t.keyId IN (:...keyIds)`, { keyIds: [...new Set(body.keyIds.filter(isNotEmpty))] })
            return await qb.getMany()
        })
    }
}
