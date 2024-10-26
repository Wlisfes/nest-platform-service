import { Injectable } from '@nestjs/common'
import { LoggerService, Logger } from '@/services/logger.service'
import { DatabaseService } from '@/services/database.service'
import { fetchResolver, fetchIntNumber } from '@/utils/utils-common'
import { Omix, OmixHeaders } from '@/interface/instance.resolver'
import { Not } from 'typeorm'
import { groupBy } from 'lodash'
import * as tree from 'tree-tool'
import * as env from '@web-system-service/interface/instance.resolver'
import * as enums from '@/enums/instance'

@Injectable()
export class SimpleService extends LoggerService {
    constructor(private readonly databaseService: DatabaseService) {
        super()
    }

    /**创建职位**/
    @Logger
    public async httpCreateSimple(headers: OmixHeaders, staffId: string, body: env.BodyCreateSimple) {
        // const ctx = await this.databaseService.fetchConnectTransaction()
        // try {
        //     await this.databaseService.fetchConnectNotEmptyError(headers, this.databaseService.tbSimple, {
        //         message: '字典名称已存在',
        //         dispatch: {
        //             where: { name: body.name, stalk: body.stalk }
        //         }
        //     })
        //     await this.databaseService.fetchConnectCreate(headers, this.databaseService.tbSimple, {
        //         body: {
        //             staffId,
        //             name: body.name,
        //             stalk: body.stalk,
        //             pid: body.pid ?? null,
        //             state: body.state ?? null,
        //             ststus: body.ststus ?? enums.SimpleStatus.enable,
        //             id: fetchIntNumber({ random: true, bit: 11 })
        //         }
        //     })
        //     return await ctx.commitTransaction().then(async () => {
        //         return await fetchResolver({ message: '操作成功' })
        //     })
        // } catch (err) {
        //     await ctx.rollbackTransaction()
        //     return await this.fetchThrowException(err.message, err.status)
        // } finally {
        //     await ctx.release()
        // }
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
