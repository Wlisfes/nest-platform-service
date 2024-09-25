import { Injectable } from '@nestjs/common'
import { Repository, Not } from 'typeorm'
import { LoggerService } from '@/services/logger.service'
import { DatabaseService } from '@/services/database.service'
import { Omix, OmixHeaders } from '@/interface/instance.resolver'
import { tbMember, tbSimple } from '@/entities/instance'
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
}
