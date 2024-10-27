import { Injectable } from '@nestjs/common'
import { LoggerService, Logger } from '@/services/logger.service'
import { DatabaseService } from '@/services/database.service'
import { RedisService } from '@/services/redis/redis.service'
import { fetchResolver, fetchCaseWherer, fetchIntNumber, fetchKeyCompose } from '@/utils/utils-common'
import { Omix, OmixHeaders, OmixRequest } from '@/interface/instance.resolver'
import { tbMember, tbSimple, tbSimpleColumn } from '@/entities/instance'
import { Not } from 'typeorm'
import { isNotEmpty } from 'class-validator'
import * as tree from 'tree-tool'
import * as env from '@web-system-service/interface/instance.resolver'
import * as enums from '@/enums/instance'

@Injectable()
export class SimpleService extends LoggerService {
    constructor(private readonly databaseService: DatabaseService, private readonly redisService: RedisService) {
        super()
    }

    /**字典类型**/
    @Logger
    public async httpColumnStalk(headers: OmixHeaders, request: OmixRequest) {
        return await fetchResolver({
            total: Object.keys(enums.SimpleStalk).length,
            list: Object.keys(enums.SimpleStalk).map(id => {
                return { id, name: enums.SimpleMapStalk[id] }
            })
        })
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
                const list = await qb.getMany().then(column => {
                    const ids = column.map(item => item.id)
                    const data = body.list.filter(item => {
                        return item.id && ids.includes(item.id) ? column.some(ele => ele.id == item.id && ele.update) : true
                    })
                    return data.map(item => ({
                        ...item,
                        sid: node.id,
                        id: fetchCaseWherer<number>(ids.includes(item.id), { value: item.id, fallback: undefined })
                    }))
                })
                /**更新字典表**/
                await this.databaseService.fetchConnectUpdate(headers, this.databaseService.tbSimple, {
                    where: { id: node.id },
                    body: { name: body.name, comment: body.comment }
                })
                /**更新字典配置表**/
                await this.databaseService.tbSimpleColumn.upsert(list, ['id'])
                /**提交事务**/
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

    /**字典列表**/
    @Logger
    public async httpColumnSimple(headers: OmixHeaders, request: OmixRequest, body: env.BodyColumnSimple) {
        return await this.databaseService.fetchConnectBuilder(headers, this.databaseService.tbSimple, async qb => {
            if (isNotEmpty(body.keyword)) {
                qb.orWhere('t.name LIKE :keyword OR t.stalk LIKE :keyword OR t.comment LIKE :keyword', { keyword: `%${body.keyword}%` })
            }
            // b.leftJoinAndSelect(tbSimpleColumn, 'column', 'column.sid = t.id')
            qb.leftJoinAndSelect(tbSimpleColumn, 'column', 'column.sid = t.id')
            qb.select([
                't.id as id',
                't.name as name',
                't.stalk as stalk',
                't.comment as comment',
                't.createTime as createTime',
                't.updateTime as updateTime'
            ])
            qb.addSelect('COUNT("column.id")', 'count')
            qb.orderBy({ 't.id': 'DESC' })
            return await qb.getRawMany().then(async list => {
                return await fetchResolver({ message: '操作成功', list, total: await qb.getCount() })
            })
        })
    }

    /**字典详情**/
    @Logger
    public async httpResolveSimple(headers: OmixHeaders, request: OmixRequest, body: env.BodyResolveSimple) {
        const node = await this.databaseService.fetchConnectEmptyError(headers, this.databaseService.tbSimple, {
            message: 'ID不存在',
            dispatch: { where: { id: body.id } }
        })
        return await this.databaseService.fetchConnectBuilder(headers, this.databaseService.tbSimpleColumn, async qb => {
            qb.where('t.sid = :sid', { sid: node.id })
            qb.orderBy({ 't.sort': 'DESC' })
            const [list = [], count = 0] = await qb.getManyAndCount()
            return await fetchResolver({
                ...node,
                count,
                list: tree.fromList(list, { id: 'id', pid: 'pid' })
            })
        })
    }
}
