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
            await this.databaseService.fetchConnectNotEmptyError(headers, this.databaseService.tbSimple, {
                message: '字典名称已存在',
                dispatch: {
                    where: { name: body.name, stalk: body.stalk, state: Not(enums.SimpleState.delete) }
                }
            })
            return await this.databaseService.fetchConnectCreate(headers, this.databaseService.tbSimple, {
                body: {
                    sid: await divineIntNumber({ random: true, bit: 11 }),
                    name: body.name,
                    stalk: body.stalk,
                    pid: body.pid ?? null,
                    props: body.props ?? null,
                    state: body.state ?? enums.SimpleState.enable
                }
            })
        } catch (err) {
            await ctx.rollbackTransaction()
            return await this.fetchThrowException(err.message, err.status)
        } finally {
            await ctx.release()
        }
    }

    /**字典树**/
    @Logger
    public async httpColumnStalkSimple(headers: OmixHeaders, staffId: string, body: env.BodyStalkSimple) {
        return await this.databaseService.fetchConnectBuilder(headers, this.databaseService.tbSimple, async qb => {
            qb.select(['t.sid', 't.name', 't.pid', 't.stalk', 't.state', 't.props', 't.sort'])
            qb.where(`t.stalk = :stalk`, { stalk: body.stalk })
            qb.orderBy({ 't.sort': 'DESC' })
            return qb.getManyAndCount().then(async ([list = [], total = 0]) => {
                return await divineResolver({ total, list: tree.fromList(list, { id: 'sid', pid: 'pid' }) })
            })
        })
    }

    /**批量字典树**/
    @Logger
    public async httpColumnBatchSimple(headers: OmixHeaders, staffId: string, body: env.BodyBatchSimple) {
        return await this.databaseService.fetchConnectBuilder(headers, this.databaseService.tbSimple, async qb => {
            qb.select(['t.sid', 't.name', 't.pid', 't.stalk', 't.state', 't.props', 't.sort'])
            // qb.where(`t.stalk = :stalk`, { stalk: body.stalk })
            qb.orderBy({ 't.sort': 'DESC' })
            return qb.getManyAndCount().then(async ([list = [], total = 0]) => {
                return await divineResolver({ total, list: tree.fromList(list, { id: 'sid', pid: 'pid' }) })
            })
        })
    }
}
