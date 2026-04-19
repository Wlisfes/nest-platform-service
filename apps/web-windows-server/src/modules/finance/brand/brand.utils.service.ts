import { Injectable } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { DataBaseService, WindowsService, schema, enums } from '@/modules/database/database.service'
import { isNotEmpty } from '@/utils'
import { OmixRequest } from '@/interface'
import * as windows from '@web-windows-server/interface'

@Injectable()
export class FinanceBrandUtilsService extends Logger {
    constructor(private readonly database: DataBaseService, private readonly windows: WindowsService) {
        super()
    }

    /**批量查询品牌**/
    @AutoDescriptor
    public async fetchUtilsUidByColumnBrand(request: OmixRequest, body: windows.UtilsUidByColumnBrandOptions) {
        if (body.keyIds.length === 0) {
            return []
        }
        return await this.database.builder(this.windows.brandOptions, async qb => {
            if (body.fields && body.fields.length > 0) {
                qb.select([...new Set(['t.keyId', ...body.fields.map(f => `t.${f}`)])])
            }
            qb.where(`t.keyId IN (:...keyIds)`, { keyIds: [...new Set(body.keyIds.filter(isNotEmpty))] })
            return await qb.getMany()
        })
    }
}
