import { Injectable } from '@nestjs/common'
import { Logger } from '@/modules/logger/logger.service'
import { DatabaseService } from '@/modules/database/database.service'
import { Omix, OmixRequest } from '@/interface/instance.resolver'
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
                    dispatch: { where: { keyId: body.pid } }
                })
            })
            await this.database.fetchConnectCreate(this.database.schemaRouter, {
                body: Object.assign(body, { keyId: await utils.fetchIntNumber(), uid: request.user.uid })
            })
            return await ctx.commitTransaction().then(async () => {
                return await this.fetchResolver({ message: '新增成功' })
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
                message: `keyId:${body.keyId} 不存在`,
                dispatch: { where: { keyId: body.keyId } }
            })
            await this.database.fetchConnectBuilder(this.database.schemaRouter, async qb => {
                qb.where(`(t.key = :key AND t.keyId != :keyId) OR (t.router = :router AND t.keyId != :keyId)`, { ...body })
                return await qb.getOne().then(async node => {
                    await plugin.fetchCatchWherer(node?.key === body.key, { message: `${body.key} 已存在` })
                    await plugin.fetchCatchWherer(node?.key === body.key, { message: `${body.router} 已存在` })
                    if (utils.isNotEmpty(body.pid)) {
                        await plugin.fetchCatchWherer(body.pid === body.keyId, { message: `keyId与pid不可相等` })
                        return await this.database.fetchConnectNotNull(this.database.schemaRouter, {
                            message: `${body.pid} 不存在`,
                            dispatch: { where: { pid: body.pid } }
                        })
                    }
                })
            })
            await this.database.fetchConnectUpdate(this.database.schemaRouter, {
                where: { keyId: body.keyId },
                body: Object.assign(body, { uid: request.user.uid })
            })
            return await ctx.commitTransaction().then(async () => {
                return await this.fetchResolver({ message: '操作成功' })
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
                    ['user', ['uid', 'name', 'status', 'id']]
                ])
                await this.database.fetchBrackets(utils.isNotEmpty(body.vague), function () {
                    return qb.where(`t.keyId LIKE :vague OR t.key LIKE :vague OR t.name LIKE :vague OR t.router LIKE :vague`, {
                        vague: `%${body.vague}%`
                    })
                })
                await this.database.fetchBrackets(utils.isNotEmpty(body.key), () => {
                    return qb.andWhere('t.key = :key', { key: body.key })
                })
                await this.database.fetchBrackets(utils.isNotEmpty(body.name), () => {
                    return qb.andWhere('t.name = :name', { name: body.name })
                })
                await this.database.fetchBrackets(utils.isNotEmpty(body.router), () => {
                    return qb.andWhere('t.router = :router', { router: body.router })
                })
                await this.database.fetchBrackets(utils.isNotEmpty(body.version), () => {
                    return qb.andWhere('t.version = :version', { version: body.version })
                })
                await this.database.fetchBrackets(utils.isNotEmpty(body.uid), () => {
                    return qb.andWhere('t.uid = :uid', { uid: body.uid })
                })
                await this.database.fetchBrackets(utils.isNotEmpty(body.startTime) && utils.isNotEmpty(body.endTime)).then(async where => {
                    if (where) {
                        return qb.andWhere('t.createTime >= :startTime AND t.createTime <= :endTime', {
                            startTime: body.startTime,
                            endTime: body.endTime
                        })
                    } else if (utils.isNotEmpty(body.startTime)) {
                        qb.andWhere('t.createTime >= :startTime', { startTime: body.startTime })
                    } else if (utils.isNotEmpty(body.endTime)) {
                        qb.andWhere('t.createTime <= :endTime', { endTime: body.endTime })
                    }
                })
                return await qb.getManyAndCount().then(async ([list = [], total = 0]) => {
                    return await this.fetchResolver({
                        message: '操作成功',
                        total,
                        list: utils.tree.fromList(list, { id: 'keyId', pid: 'pid' })
                    })
                })
            })
        } catch (err) {
            return await this.fetchCatchCompiler('SystemRouterService:httpBaseColumnSystemRouter', err)
        }
    }

    /**获取当前用户菜单资源**/
    public async httpBaseColumnUserSystemRouter(request: OmixRequest) {
        try {
            return await this.database.fetchConnectBuilder(this.database.schemaRouter, async qb => {
                await this.database.fetchSelection(qb, [
                    ['t', ['keyId', 'pid', 'key', 'name', 'router', 'active', 'check']],
                    ['t', ['iconName', 'type', 'status', 'version']]
                ])
                return await qb.getMany().then(async data => {
                    const list = utils.tree.fromList(data, { id: 'keyId', pid: 'pid' })
                    console.log(utils.tree.removeNode(list, (node: Omix) => node.keyId === '2280242606426357760'))
                    return {
                        list: utils.tree.fromList(list, { id: 'keyId', pid: 'pid' })
                    }
                })
            })
        } catch (err) {
            return await this.fetchCatchCompiler('SystemRouterService:httpBaseColumnUserSystemRouter', err)
        }
    }

    /**菜单资源详情**/
    public async httpBaseSystemRouterResolver(request: OmixRequest, body: field.BaseSystemRouterResolver) {
        try {
            return await this.database.fetchConnectNotNull(this.database.schemaRouter, {
                message: `keyId:${body.keyId} 不存在`,
                dispatch: { where: { keyId: body.keyId } }
            })
        } catch (err) {
            return await this.fetchCatchCompiler('SystemRouterService:httpBaseSystemRouterResolver', err)
        }
    }
}
