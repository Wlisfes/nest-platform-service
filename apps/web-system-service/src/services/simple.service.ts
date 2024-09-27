import { Injectable } from '@nestjs/common'
import { LoggerService, Logger } from '@/services/logger.service'
import { DatabaseService } from '@/services/database.service'
import { WhereSimpleService } from '@/wheres/where-simple.service'
import { divineResolver, divineIntNumber } from '@/utils/utils-common'
import { Omix, OmixHeaders } from '@/interface/instance.resolver'
import { Not } from 'typeorm'
import { groupBy } from 'lodash'
import * as tree from 'tree-tool'
import * as env from '@web-system-service/interface/instance.resolver'
import * as enums from '@/enums/instance'

@Injectable()
export class SimpleService extends LoggerService {
    constructor(private readonly databaseService: DatabaseService, private readonly whereSimpleService: WhereSimpleService) {
        super()
    }

    /**创建职位**/
    @Logger
    public async httpCreateSimple(headers: OmixHeaders, staffId: string, body: env.BodyCreateSimple) {
        const ctx = await this.databaseService.fetchConnectTransaction()
        try {
            /**验证字典名称是否已存在**/
            await this.whereSimpleService.fetchSimpleNameNotEmpty(headers, { name: body.name, stalk: body.stalk })
            /**写入字典表**/
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

    /**批量字典树**/
    @Logger
    public async httpColumnSimple(headers: OmixHeaders, staffId: string, body: env.BodyColumnSimple) {
        return await this.databaseService.fetchConnectBuilder(headers, this.databaseService.tbSimple, async qb => {
            qb.select(['t.sid', 't.name', 't.pid', 't.stalk', 't.state', 't.props'])
            qb.orderBy({ 't.sort': 'DESC' })
            qb.where(`t.stalk IN(:...stalk) AND t.state = :state`, {
                stalk: body.batch,
                state: enums.SimpleState.enable
            })
            return qb.getManyAndCount().then(async ([list = [], total = 0]) => {
                const by = body.batch.reduce((curr, keyName) => ({ ...curr, [keyName]: [] }), {})
                const stalkBy: Partial<Record<enums.SimpleStalk, Array<env.RestSimple>>> = groupBy(list, 'stalk')
                return await divineResolver({ ...by, ...stalkBy })
            })
        })
    }

    /**字典类型**/
    @Logger
    public async httpColumnStalk(headers: OmixHeaders, staffId: string) {
        return await divineResolver({
            total: Object.keys(enums.SimpleStalk).length,
            list: Object.keys(enums.SimpleStalk).map(sid => {
                return { sid, name: enums.SimpleMapStalk[sid] }
            })
        })
    }

    /**字典树**/
    @Logger
    public async httpColumnStalkSimple(headers: OmixHeaders, staffId: string, body: env.BodyStalkSimple) {
        return await this.databaseService.fetchConnectBuilder(headers, this.databaseService.tbSimple, async qb => {
            qb.select(['t.sid', 't.name', 't.pid', 't.stalk', 't.state', 't.props'])
            qb.orderBy({ 't.sort': 'DESC' })
            qb.where(`t.stalk = :stalk AND t.state = :state`, {
                stalk: body.stalk,
                state: enums.SimpleState.enable
            })
            return qb.getManyAndCount().then(async ([list = [], total = 0]) => {
                return await divineResolver({ total, list: tree.fromList(list, { id: 'sid', pid: 'pid' }) })
            })
        })
    }
}
