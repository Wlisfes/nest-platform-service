import { Injectable } from '@nestjs/common'
import { Repository } from 'typeorm'
import { LoggerService } from '@/services/logger.service'
import { DatabaseService } from '@/services/database.service'
import { Omix, OmixHeaders } from '@/interface/instance.resolver'
import { tbDept } from '@/entities/instance'
import { difference } from 'lodash'

export type DeptOptions = Parameters<Repository<tbDept>['findOne']>['0']

@Injectable()
export class WhereDeptService extends LoggerService {
    constructor(private readonly databaseService: DatabaseService) {
        super()
    }

    /**部门数据存在验证**/
    public async fetchDeptNotNullValidator(headers: OmixHeaders, option: { message: string; where: DeptOptions['where'] }) {
        return await this.databaseService.fetchConnectNotEmptyError(headers, this.databaseService.tbDept, {
            message: option.message,
            dispatch: {
                where: option.where
            }
        })
    }

    /**部门数据不存在验证**/
    public async fetchDeptNullValidator(headers: OmixHeaders, option: { message: string; where: DeptOptions['where'] }) {
        return await this.databaseService.fetchConnectEmptyError(headers, this.databaseService.tbDept, {
            message: option.message,
            dispatch: {
                where: option.where
            }
        })
    }

    /**验证部门列表ID是否不存在**/
    public async fetchDeptDiffColumnValidator(headers: OmixHeaders, option: Omix<{ dept: Array<string>; fieldName: string }>) {
        return await this.databaseService.fetchConnectBuilder(headers, this.databaseService.tbDept, async qb => {
            qb.where('t.deptId IN(:...deptId)', { deptId: option.dept })
            return await qb.getMany().then(async column => {
                const differ = difference(
                    option.dept,
                    column.map(item => item.deptId)
                )
                await this.fetchWhereException(differ.length > 0, async where => {
                    return this.fetchThrowException(`${option.fieldName}: [${differ.join(',')}] 不存在`, 400)
                })
                return column
            })
        })
    }
}
