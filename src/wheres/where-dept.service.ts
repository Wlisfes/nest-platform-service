import { Injectable } from '@nestjs/common'
import { Repository } from 'typeorm'
import { LoggerService } from '@/services/logger.service'
import { DatabaseService } from '@/services/database.service'
import { OmixHeaders } from '@/interface/instance.resolver'
import { tbDept } from '@/entities/instance'
import { difference } from 'lodash'

@Injectable()
export class WhereDeptService extends LoggerService {
    constructor(private readonly databaseService: DatabaseService) {
        super()
    }

    /**验证部门名称是否已存在**/
    public async fetchDeptNameNotEmpty(headers: OmixHeaders, dispatch: Parameters<Repository<tbDept>['findOne']>['0']) {
        return await this.databaseService.fetchConnectNotEmptyError(headers, this.databaseService.tbDept, {
            message: '部门已存在',
            dispatch: dispatch
        })
    }

    /**验证部门名称是否不存在**/
    public async fetchDeptNameEmpty(headers: OmixHeaders, dispatch: Parameters<Repository<tbDept>['findOne']>['0']) {
        return await this.databaseService.fetchConnectEmptyError(headers, this.databaseService.tbDept, {
            message: '部门不存在',
            dispatch: dispatch
        })
    }

    /**验证部门列表ID是否不存在**/
    public async fetchDeptColumnEmpty(headers: OmixHeaders, deptId: Array<string>) {
        await this.databaseService.fetchConnectBuilder(headers, this.databaseService.tbDept, async qb => {
            qb.where('t.deptId IN(:...deptId)', { deptId: deptId })
            const differ = await qb.getMany().then(dept => {
                return difference(
                    deptId,
                    dept.map(item => item.deptId)
                )
            })
            return await this.fetchWhereException(differ.length > 0, async where => {
                return this.fetchThrowException(`dept: [${differ.join(',')}] 不存在`, 400)
            })
        })
    }
}
