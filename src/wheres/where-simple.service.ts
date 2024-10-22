import { Injectable } from '@nestjs/common'
import { Repository, Not } from 'typeorm'
import { LoggerService } from '@/services/logger.service'
import { DatabaseService } from '@/services/database.service'
import { Omix, OmixHeaders } from '@/interface/instance.resolver'
import { tbMember, tbSimple } from '@/entities/instance'
import { difference } from 'lodash'
import * as enums from '@/enums/instance'

@Injectable()
export class WhereSimpleService extends LoggerService {
    constructor(private readonly databaseService: DatabaseService) {
        super()
    }

    /**验证字典名称是否已存在**/
    public async fetchSimpleNameNotEmpty(headers: OmixHeaders, body: Omix<{ name: string; stalk: string }>) {
        return await this.databaseService.fetchConnectNotEmptyError(headers, this.databaseService.tbSimple, {
            message: '字典名称已存在',
            dispatch: {
                where: { name: body.name, stalk: body.stalk, state: Not(enums.SimpleState.delete) }
            }
        })
    }

    /**验证字典ID列表是否不存在**/
    public async fetchSimpleDiffColumnValidator(headers: OmixHeaders, option: Omix<{ ids: Array<string>; stalk: string }>) {
        return await this.databaseService.fetchConnectBuilder(headers, this.databaseService.tbSimple, async qb => {
            qb.where('t.id IN(:...ids)', { ids: option.ids })
            qb.andWhere('t.stalk = :stalk', { stalk: option.stalk })
            return await qb.getMany().then(async column => {
                const differ = difference(
                    option.ids,
                    column.map(item => item.id)
                )
                await this.fetchWhereException(differ.length > 0, async where => {
                    return this.fetchThrowException(`${option.stalk}: [${differ.join(',')}] 不存在`, 400)
                })
                return column
            })
        })
    }
}
