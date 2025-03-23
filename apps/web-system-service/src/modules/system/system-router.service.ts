import { Injectable } from '@nestjs/common'
import { Logger } from '@/modules/logger/logger.service'
import { DatabaseService } from '@/modules/database/database.service'
import { OmixRequest } from '@/interface/instance.resolver'
import * as field from '@web-system-service/interface/router.resolver'
import * as schema from '@/modules/database/database.schema'
import * as enums from '@/modules/database/database.enums'
import * as plugin from '@/utils/utils-plugin'
import * as utils from '@/utils/utils-common'

@Injectable()
export class SystemRouterService extends Logger {
    constructor(private readonly database: DatabaseService) {
        super()
    }

    /**新增菜单资源**/
    public async httpBaseCreateSystemRouter(request: OmixRequest, body: field.BaseCreateSystemRouter) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
            await this.database.fetchConnectNull(this.database.schemaRouter, {
                message: `key:${body.key} 已存在`,
                dispatch: { where: { key: body.key } }
            })
            await this.database.fetchConnectNull(this.database.schemaRouter, {
                message: `router:${body.router} 已存在`,
                dispatch: { where: { router: body.router } }
            })
            await utils.fetchHandler(utils.isNotEmpty(body.pid), async () => {
                return await this.database.fetchConnectNotNull(this.database.schemaRouter, {
                    message: `pid:${body.pid} 不存在`,
                    dispatch: { where: { id: body.pid } }
                })
            })
            await this.database.fetchConnectCreate(this.database.schemaRouter, {
                body: Object.assign(body, { id: await utils.fetchIntNumber(), uid: request.user.uid })
            })
            return await ctx.commitTransaction().then(async () => {
                return await utils.fetchResolver({ message: '新增成功' })
            })
        } catch (err) {
            await ctx.rollbackTransaction()
            return await this.fetchCatchCompiler('SystemRouterService:httpBaseCreateSystemRouter', err)
        } finally {
            await ctx.release()
        }
    }

    /**编辑菜单资源**/
    public async httpBaseUpdateSystemRouter(request: OmixRequest, body: field.BaseUpdateSystemRouter) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
            await this.database.fetchConnectNotNull(this.database.schemaRouter, {
                message: `id:${body.id} 不存在`,
                dispatch: { where: { id: body.pid } }
            })
            await this.database.fetchConnectBuilder(this.database.schemaRouter, async qb => {
                qb.where(`(t.key = :key AND t.id != id) OR (t.router = :router AND t.id != id)`, { ...body })
                return await qb.getOne().then(async node => {
                    await plugin.fetchCatchWherer(node?.key === body.key, { message: `${body.key} 已存在` })
                    await plugin.fetchCatchWherer(node?.key === body.key, { message: `${body.router} 已存在` })
                    if (utils.isNotEmpty(body.pid)) {
                        await plugin.fetchCatchWherer(body.pid === body.id, { message: `id与pid不可相等` })
                        return await this.database.fetchConnectNotNull(this.database.schemaRouter, {
                            message: `${body.pid} 不存在`,
                            dispatch: { where: { pid: body.pid } }
                        })
                    }
                })
            })
            await this.database.fetchConnectUpdate(this.database.schemaRouter, {
                where: { id: body.id },
                body: Object.assign(body, { uid: request.user.uid })
            })
            return await ctx.commitTransaction().then(async () => {
                return await utils.fetchResolver({ message: '操作成功' })
            })
        } catch (err) {
            await ctx.rollbackTransaction()
            return await this.fetchCatchCompiler('SystemRouterService:httpBaseUpdateSystemRouter', err)
        } finally {
            await ctx.release()
        }
    }

    /**菜单资源列表**/
    public async httpBaseColumnSystemRouter(request: OmixRequest, body: field.BaseColumnSystemRouter) {
        try {
            return await this.database.fetchConnectBuilder(this.database.schemaRouter, async qb => {
                await qb.leftJoinAndMapOne('t.user', schema.SchemaUser, 'user', 'user.uid = t.uid')
                await this.database.fetchSelection(qb, [
                    ['t', ['uid', 'pid', 'key', 'name', 'router', 'active', 'check', 'iconName', 'sort', 'type', 'status', 'version']],
                    ['t', ['keyId', 'id', 'createTime', 'modifyTime']],
                    ['user', ['uid', 'nickname', 'status', 'keyId', 'system']]
                ])
                return await qb.getManyAndCount().then(async ([list = [], total = 0]) => {
                    return {
                        total,
                        list: utils.tree.fromList(list, { pid: 'pid' })
                    }
                })
            })
        } catch (err) {
            return await this.fetchCatchCompiler('SystemRouterService:httpBaseColumnSystemRouter', err)
        }
    }

    /**菜单资源详情**/
    public async httpBaseSystemRouterResolver(request: OmixRequest, body: field.BaseSystemRouterResolver) {
        try {
            return await this.database.fetchConnectNotNull(this.database.schemaRouter, {
                message: `id:${body.id} 不存在`,
                dispatch: { where: { id: body.id } }
            })
        } catch (err) {
            return await this.fetchCatchCompiler('SystemRouterService:httpBaseSystemRouterResolver', err)
        }
    }
}
