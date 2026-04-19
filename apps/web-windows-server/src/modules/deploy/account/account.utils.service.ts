import { Injectable } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { DataBaseService, WindowsService } from '@/modules/database/database.service'
import { fetchCloneByte, isNotEmpty } from '@/utils'
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
            if (body.fields && body.fields.length > 0) {
                qb.select([...new Set(['t.uid', ...body.fields.map(f => `t.${f}`)])])
            }
            qb.where(`t.uid IN (:...uids)`, { uids: [...new Set(body.uids.filter(isNotEmpty))] })
            return await qb.getMany()
        })
    }

    /**批量查询创建人/修改人数据**/
    @AutoDescriptor
    public async fetchUtilsMergeColumnAccount(request: OmixRequest, body: windows.UtilsMergeColumnAccountOptions) {
        const items = await this.fetchUtilsUidByColumnAccount(request, {
            uids: body.list.map(item => [item.createBy, item.modifyBy].filter(Boolean)).flat(),
            fields: body.fields
        })
        return body.list.map(item => {
            return fetchCloneByte(item, {
                createBy: items.find(e => e.uid === item.createBy),
                modifyBy: items.find(e => e.uid === item.modifyBy)
            })
        })
    }
}
