import { Injectable } from '@nestjs/common'
import { LoggerService, Logger } from '@/services/logger.service'
import { DatabaseService } from '@/services/database.service'
import { WhereRouterService } from '@/wheres/where-router.service'
import { divineResolver, divineIntNumber } from '@/utils/utils-common'
import { OmixHeaders } from '@/interface/instance.resolver'
import { Not } from 'typeorm'
import { isNotEmpty } from 'class-validator'
import * as tree from 'tree-tool'
import * as env from '@web-system-service/interface/instance.resolver'
import * as enums from '@/enums/instance'

@Injectable()
export class RouterService extends LoggerService {
    constructor(private readonly databaseService: DatabaseService, private readonly whereRouterService: WhereRouterService) {
        super()
    }

    /**创建菜单**/
    @Logger
    public async httpCreateRouter(headers: OmixHeaders, staffId: string, body: env.BodyCreateRouter) {
        const ctx = await this.databaseService.fetchConnectTransaction()
        try {
            await this.whereRouterService.fetchRouterNotNullValidator(headers, {
                message: '唯一标识已存在',
                where: { instance: body.instance }
            })
            await this.databaseService.fetchConnectCreate(headers, this.databaseService.tbRouter, {
                body: {
                    sid: await divineIntNumber({ random: true, bit: 11 }),
                    staffId,
                    name: body.name,
                    show: body.show,
                    version: body.version,
                    sort: body.sort,
                    type: body.type,
                    state: body.state,
                    icon: body.icon ?? null,
                    instance: body.instance,
                    path: body.path ?? null,
                    pid: body.pid ?? null,
                    active: body.active ?? null
                }
            })
            return await ctx.commitTransaction().then(async () => {
                return await divineResolver({ message: '操作成功' })
            })
        } catch (err) {
            await ctx.rollbackTransaction()
            return await this.fetchThrowException(err.message, err.status)
        } finally {
            await ctx.release()
        }
    }

    /**编辑菜单**/
    @Logger
    public async httpUpdateRouter(headers: OmixHeaders, staffId: string, body: env.BodyUpdateRouter) {
        const ctx = await this.databaseService.fetchConnectTransaction()
        try {
            await this.whereRouterService.fetchRouterNullValidator(headers, {
                message: 'sid不存在',
                where: { sid: body.sid }
            })
            await this.whereRouterService.fetchRouterNotNullValidator(headers, {
                message: '唯一标识已存在',
                where: { instance: body.instance, sid: Not(body.sid) }
            })
            await this.databaseService.fetchConnectUpdate(headers, this.databaseService.tbRouter, {
                where: { sid: body.sid },
                body: {
                    staffId,
                    type: body.type,
                    name: body.name,
                    pid: body.pid ?? null,
                    version: body.version,
                    state: body.state,
                    sort: body.sort,
                    show: body.show,
                    icon: body.icon ?? null,
                    instance: body.instance ?? null,
                    path: body.path ?? null,
                    active: body.active ?? null
                }
            })
            return await ctx.commitTransaction().then(async () => {
                return await divineResolver({ message: '操作成功' })
            })
        } catch (err) {
            await ctx.rollbackTransaction()
            return await this.fetchThrowException(err.message, err.status)
        } finally {
            await ctx.release()
        }
    }

    /**菜单列表**/
    @Logger
    public async httpColumnRouter(headers: OmixHeaders, staffId: string) {
        const { list, total } = await this.databaseService.fetchConnectAndCount(headers, this.databaseService.tbRouter, {})
        return await divineResolver({ total, list })
    }

    /**所有菜单树**/
    @Logger
    public async httpColumnTreeRouter(headers: OmixHeaders, staffId: string, body: env.BodyColumnTreeRouter) {
        return await this.databaseService.fetchConnectBuilder(headers, this.databaseService.tbRouter, async qb => {
            if (isNotEmpty(body.type)) {
                qb.where('t.type = :type', { type: body.type })
            }
            return qb.getManyAndCount().then(async ([list = [], total = 0]) => {
                return await divineResolver({
                    total,
                    list: tree.fromList(list, { id: 'sid', pid: 'pid' })
                })
            })
        })
    }

    /**菜单详情**/
    @Logger
    public async httpResolveRouter(headers: OmixHeaders, staffId: string, body: env.BodyResolveRouter) {
        return await this.whereRouterService.fetchRouterNullValidator(headers, {
            message: 'sid不存在',
            where: { sid: body.sid }
        })
    }
}
