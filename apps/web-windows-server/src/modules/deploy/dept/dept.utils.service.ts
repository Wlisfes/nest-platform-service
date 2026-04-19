import { Injectable } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { DataBaseService, WindowsService } from '@/modules/database/database.service'
import { omit, isNotEmpty } from '@/utils'
import { OmixRequest } from '@/interface'
import * as schema from '@/modules/database/schema'
import * as windows from '@web-windows-server/interface'

@Injectable()
export class DeployDeptUtilsService extends Logger {
    constructor(private readonly database: DataBaseService, private readonly windows: WindowsService) {
        super()
    }

    /**批量查询账号关联部门**/
    @AutoDescriptor
    public async fetchUtilsUidByColumnDepartment(request: OmixRequest, body: windows.UtilsUidByColumnDepartmentOptions) {
        if (body.uids.length === 0) {
            return []
        }
        return await this.database.builder(this.windows.deptAccountOptions, async qb => {
            qb.leftJoinAndMapOne('t.dept', schema.WindowsDept, 'dept', 'dept.key_id = t.deptId')
            qb.where(`t.uid IN (:...uids)`, { uids: [...new Set(body.uids.filter(isNotEmpty))] })
            return await qb.getMany().then(list => {
                return list.map((item: Omix) => ({
                    ...omit(item, ['dept', 'createTime', 'modifyTime']),
                    pid: item.dept?.pid,
                    alias: item.dept?.alias,
                    deptId: item.dept?.keyId,
                    deptName: item.dept?.name
                }))
            })
        })
    }
}
