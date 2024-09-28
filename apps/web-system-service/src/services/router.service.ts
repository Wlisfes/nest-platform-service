import { Injectable } from '@nestjs/common'
import { Not } from 'typeorm'
import { LoggerService, Logger } from '@/services/logger.service'
import { DatabaseService } from '@/services/database.service'
import { WhereDeptService } from '@/wheres/where-dept.service'
import { divineResolver, divineIntNumber } from '@/utils/utils-common'
import { OmixHeaders } from '@/interface/instance.resolver'
import * as tree from 'tree-tool'
import * as env from '@web-system-service/interface/instance.resolver'
import * as enums from '@/enums/instance'

@Injectable()
export class RouterService extends LoggerService {
    constructor(private readonly databaseService: DatabaseService, private readonly whereDeptService: WhereDeptService) {
        super()
    }

    /**创建菜单**/
    @Logger
    public async httpCreateRouter(headers: OmixHeaders, staffId: string, body: env.BodyCreateDept) {}
}
