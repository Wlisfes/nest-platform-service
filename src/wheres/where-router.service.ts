import { Injectable } from '@nestjs/common'
import { Repository, Not } from 'typeorm'
import { LoggerService } from '@/services/logger.service'
import { DatabaseService } from '@/services/database.service'
import { Omix, OmixHeaders } from '@/interface/instance.resolver'
import { tbMember, tbSimple } from '@/entities/instance'
import { difference } from 'lodash'
import * as enums from '@/enums/instance'

@Injectable()
export class WhereRouterService extends LoggerService {
    constructor(private readonly databaseService: DatabaseService) {
        super()
    }

    /**验证唯一标识已存在**/
    public async fetchRouterInstanceNotEmpty(headers: OmixHeaders, body: Omix<{ instance: string }>) {
        return await this.databaseService.fetchConnectNotEmptyError(headers, this.databaseService.tbRouter, {
            message: '唯一标识已存在',
            dispatch: {
                where: { instance: body.instance }
            }
        })
    }
}
