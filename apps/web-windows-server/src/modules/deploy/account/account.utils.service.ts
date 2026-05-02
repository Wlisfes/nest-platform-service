import { Injectable } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { DataBaseService, WindowsService, schema } from '@/modules/database/database.service'
import { fetchObsUpdate, isNotEmpty, fetchCurrent } from '@/utils'
import { OmixRequest } from '@/interface'
import * as windows from '@web-windows-server/interface'

@Injectable()
export class DeployAccountUtilsService extends Logger {
    constructor(private readonly database: DataBaseService, private readonly windows: WindowsService) {
        super()
    }

    /**批量查询账号**/
    @AutoDescriptor
    public async fetchUtilsUidByColumnAccount(request: OmixRequest, body: windows.UtilsUidByColumnAccountOptions) {
        if (body.uids.length === 0) {
            return []
        }
        return await this.database.builder(this.windows.accountOptions, async qb => {
            const fields: Array<keyof schema.WindowsAccount> = ['keyId', 'name', 'number', 'email', 'phone', 'avatar', 'status']
            if (body.fields && body.fields.length > 0) {
                qb.select([...new Set(['t.uid', ...body.fields.map(f => `t.${f}`)])])
            } else {
                qb.select(['t.uid', ...fields.map(f => `t.${f}`)])
            }
            qb.where(`t.uid IN (:...uids)`, { uids: [...new Set(body.uids.filter(isNotEmpty))] })
            return await qb.getMany()
        })
    }

    /**批量查询创建人/修改人数据**/
    @AutoDescriptor
    public async fetchUtilsColumnByAccount(request: OmixRequest, body: windows.UtilsColumnByAccountOptions) {
        return await this.fetchUtilsUidByColumnAccount(request, {
            uids: [...new Set(body.list.map(item => [item.createBy, item.modifyBy].filter(isNotEmpty)).flat())],
            fields: body.fields
        })
    }
}
