import { Injectable } from '@nestjs/common'
import { Repository, Not } from 'typeorm'
import { LoggerService } from '@/services/logger.service'
import { DatabaseService } from '@/services/database.service'
import { Omix, OmixHeaders } from '@/interface/instance.resolver'
import { tbMember, tbRouter } from '@/entities/instance'
import { difference } from 'lodash'
import * as enums from '@/enums/instance'

export type WhereRouter = Parameters<Repository<tbRouter>['findOne']>['0']

@Injectable()
export class WhereRouterService extends LoggerService {
    constructor(private readonly databaseService: DatabaseService) {
        super()
    }

    /**菜单数据存在验证**/
    public async fetchRouterNotNullValidator(headers: OmixHeaders, option: Omix<{ message: string; where: WhereRouter['where'] }>) {
        return await this.databaseService.fetchConnectNotEmptyError(headers, this.databaseService.tbRouter, {
            message: option.message,
            dispatch: {
                where: option.where
            }
        })
    }

    /**菜单数据不存在验证**/
    public async fetchRouterNullValidator(headers: OmixHeaders, option: { message: string; where: WhereRouter['where'] }) {
        return await this.databaseService.fetchConnectEmptyError(headers, this.databaseService.tbRouter, {
            message: option.message,
            dispatch: {
                where: option.where
            }
        })
    }
}
