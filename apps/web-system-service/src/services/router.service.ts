import { Injectable } from '@nestjs/common'
import { Not } from 'typeorm'
import { LoggerService, Logger } from '@/services/logger.service'
import { DatabaseService } from '@/services/database.service'
import { WhereRouterService } from '@/wheres/where-router.service'
import { divineResolver, divineIntNumber } from '@/utils/utils-common'
import { OmixHeaders } from '@/interface/instance.resolver'
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
            /**菜单数据存在验证**/
            await this.whereRouterService.fetchRouterNotNullValidator(headers, {
                message: '唯一标识已存在',
                where: { instance: body.instance }
            })
            /**写入菜单表**/
            return await this.databaseService.fetchConnectCreate(headers, this.databaseService.tbRouter, {
                body: {
                    sid: await divineIntNumber({ random: true, bit: 11 }),
                    staffId: staffId,
                    name: body.name,
                    instance: body.instance,
                    show: body.show,
                    version: body.version,
                    sort: body.sort,
                    type: body.type,
                    state: body.state,
                    path: body.path ?? null,
                    icon: body.icon ?? null,
                    pid: body.pid ?? null,
                    active: body.active ?? null
                }
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
            /**菜单数据不存在验证**/
            const node = await this.whereRouterService.fetchRouterNullValidator(headers, {
                message: 'sid不存在',
                where: { sid: body.sid }
            })
            /**菜单数据存在验证**/
            await this.whereRouterService.fetchRouterNotNullValidator(headers, {
                message: '唯一标识已存在',
                where: { instance: body.instance, sid: Not(body.sid) }
            })
        } catch (err) {
            await ctx.rollbackTransaction()
            return await this.fetchThrowException(err.message, err.status)
        } finally {
            await ctx.release()
        }
    }

    /**所有菜单树**/
    @Logger
    public async httpColumnTreeRouter(headers: OmixHeaders, staffId: string) {
        const { list, total } = await this.databaseService.fetchConnectAndCount(headers, this.databaseService.tbRouter, {
            select: ['sid', 'pid', 'type', 'name']
        })
        return await divineResolver({
            total,
            list: tree.fromList(list, { id: 'sid', pid: 'pid' })
        })
    }
}
