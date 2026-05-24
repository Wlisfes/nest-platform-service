import { Injectable } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { DataBaseService, WindowsService, schema } from '@/modules/database/database.service'
import { isNotEmpty } from '@/utils'
import { OmixRequest } from '@/interface'

@Injectable()
export class FinanceSmsRateUtilsService extends Logger {
    constructor(private readonly database: DataBaseService, private readonly windows: WindowsService) {
        super()
    }

    /**根据keyId查询基础费率**/
    @AutoDescriptor
    public async fetchUtilsByKeyIdSmsRate(request: OmixRequest, body: Omix<{ keyId: number }>) {
        return await this.database.empty(this.windows.basicSmsRateOptions, {
            request,
            message: 'keyId:不存在',
            dispatch: { where: { keyId: body.keyId } }
        })
    }

    /**根据keyId批量查询基础费率**/
    @AutoDescriptor
    public async fetchUtilsByColumnSmsRate(request: OmixRequest, body: Omix<{ keyIds: Array<number>, fields?: Array<keyof schema.WindowsBasicSmsRate> }>) {
        if (body.keyIds.length === 0) {
            return []
        }
        return await this.database.builder(this.windows.basicSmsRateOptions, async qb => {
            if (body.fields && body.fields.length > 0) {
                qb.select([...new Set(['t.keyId', ...body.fields.map(f => `t.${f}`)])])
            }
            qb.where(`t.keyId IN (:...keyIds)`, { keyIds: [...new Set(body.keyIds.filter(isNotEmpty))] })
            return await qb.getMany()
        })
    }

    /**根据code查询单条基础费率**/
    @AutoDescriptor
    public async fetchUtilsByCodeSmsRate(request: OmixRequest, body: Omix<{ code: string }>) {
        return await this.database.empty(this.windows.basicSmsRateOptions, {
            request,
            message: 'code:不存在',
            dispatch: { where: { code: body.code } }
        })
    }

    /**根据code批量查询基础费率**/
    @AutoDescriptor
    public async fetchUtilsByCodesSmsRate(request: OmixRequest, body: Omix<{ codes: Array<string> }>) {
        if (body.codes.length === 0) {
            return []
        }
        return await this.database.builder(this.windows.basicSmsRateOptions, async qb => {
            qb.where(`t.code IN (:...codes)`, { codes: [...new Set(body.codes.filter(isNotEmpty))] })
            return await qb.getMany()
        })
    }
}
