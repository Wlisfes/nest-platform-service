import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common'
import { Not } from 'typeorm'
import { LoggerService, Logger } from '@/services/logger.service'
import { DatabaseService } from '@/services/database.service'
import { divineResolver, divineIntNumber, divineBstract, divineHandler } from '@/utils/utils-common'
import { OmixHeaders } from '@/interface/instance.resolver'
import * as tree from 'tree-tool'
import * as env from '@web-account-service/interface/instance.resolver'
import * as enums from '@/enums/instance'

@Injectable()
export class SimpleService extends LoggerService {
    constructor(private readonly databaseService: DatabaseService) {
        super()
    }

    /**创建职位**/
    @Logger
    public async httpCreateSimple(headers: OmixHeaders, staffId: string, body: env.BodyCreateSimple) {
        const ctx = await this.databaseService.fetchConnectTransaction()
        try {
        } catch (err) {
            await ctx.rollbackTransaction()
            return await this.fetchThrowException(err.message, err.status)
        } finally {
            await ctx.release()
        }
    }

    /**字典树**/
    @Logger
    public async httpColumnSimple(headers: OmixHeaders, staffId: string, body) {
        return await this.databaseService.fetchConnectBuilder(headers, this.databaseService.tbSimple, async qb => {
            // qb.leftJoinAndMapMany('t.dept', tbDeptMember, 'dept', 't.staffId = dept.staffId')
            // qb.leftJoinAndMapOne('dept.name', tbDept, 'deptName', 'dept.deptId = deptName.deptId')
            return qb.getManyAndCount().then(async ([list = [], total = 0]) => {
                return await divineResolver({ total, list })
            })
        })
    }
}
