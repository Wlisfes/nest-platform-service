import { Injectable } from '@nestjs/common'
import { LoggerService, Logger } from '@/services/logger.service'
import { DatabaseService } from '@/services/database.service'
import { RedisService } from '@/services/redis/redis.service'
import { fetchResolver, fetchCaseWherer, fetchIntNumber, fetchKeyCompose } from '@/utils/utils-common'
import { Omix, OmixHeaders, OmixRequest } from '@/interface/instance.resolver'
import { Not } from 'typeorm'
import { groupBy } from 'lodash'
import * as tree from 'tree-tool'
import * as env from '@web-system-service/interface/instance.resolver'
import * as enums from '@/enums/instance'

@Injectable()
export class SimpleService extends LoggerService {
    constructor(private readonly databaseService: DatabaseService, private readonly redisService: RedisService) {
        super()
    }

    /**更新字典**/
    @Logger
    public async httpUpdateSimple(headers: OmixHeaders, request: OmixRequest, body: env.BodyUpdateSimple) {
        const ctx = await this.databaseService.fetchConnectTransaction()
        try {
            const node = await this.databaseService.fetchConnectEmptyError(headers, this.databaseService.tbSimple, {
                message: 'ID不存在',
                dispatch: { where: { id: body.id } }
            })
            return await this.databaseService.fetchConnectBuilder(headers, this.databaseService.tbSimpleColumn, async qb => {
                qb.where(`t.sid = :sid`, { sid: node.id })
                const ids = (await qb.getMany()).map(item => item.id)
                const list = body.list.map(item => ({
                    ...item,
                    sid: node.id,
                    id: fetchCaseWherer<number>(ids.includes(item.id), { value: item.id, fallback: undefined })
                }))
                await this.databaseService.tbSimpleColumn.upsert(list, ['id'])
                return await ctx.commitTransaction().then(async () => {
                    return await fetchResolver({ message: '操作成功' })
                })
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
        // return await this.databaseService.fetchConnectBuilder(headers, this.databaseService.tbSimple, async qb => {
        //     qb.select(['t.id', 't.name', 't.pid', 't.stalk', 't.state', 't.status'])
        //     qb.orderBy({ 't.sort': 'DESC' })
        //     qb.where(`t.stalk IN(:...stalk) AND t.status = :status`, {
        //         stalk: body.batch,
        //         status: enums.SimpleStatus.enable
        //     })
        //     return qb.getManyAndCount().then(async ([list = [], total = 0]) => {
        //         const by = body.batch.reduce((curr, keyName) => ({ ...curr, [keyName]: [] }), {})
        //         const stalkBy: Partial<Record<enums.SimpleStalk, Array<env.RestSimple>>> = groupBy(list, 'stalk')
        //         return await fetchResolver({ ...by, ...stalkBy })
        //     })
        // })
    }

    /**字典类型**/
    @Logger
    public async httpColumnStalk(headers: OmixHeaders, staffId: string) {
        // return await fetchResolver({
        //     total: Object.keys(enums.SimpleStalk).length,
        //     list: Object.keys(enums.SimpleStalk).map(id => {
        //         return { id, name: enums.SimpleMapStalk[id] }
        //     })
        // })
    }

    /**字典树**/
    @Logger
    public async httpColumnStalkSimple(headers: OmixHeaders, staffId: string, body: env.BodyStalkSimple) {
        // return await this.databaseService.fetchConnectBuilder(headers, this.databaseService.tbSimple, async qb => {
        //     qb.select(['t.id', 't.name', 't.pid', 't.stalk', 't.state', 't.status'])
        //     qb.orderBy({ 't.sort': 'DESC' })
        //     qb.where(`t.stalk = :stalk AND t.status = :status`, {
        //         stalk: body.stalk,
        //         status: enums.SimpleStatus.enable
        //     })
        //     return qb.getManyAndCount().then(async ([list = [], total = 0]) => {
        //         return await fetchResolver({ total, list: tree.fromList(list, { id: 'id', pid: 'pid' }) })
        //     })
        // })
    }
}
