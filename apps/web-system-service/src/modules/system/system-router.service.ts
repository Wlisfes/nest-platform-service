import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Not } from 'typeorm'
import { Logger, AutoMethodDescriptor } from '@/modules/logger/logger.service'
import { DatabaseService } from '@/modules/database/database.service'
import { SystemChunkService } from '@web-system-service/modules/system/system-chunk.service'
import { Omix, OmixRequest } from '@/interface/instance.resolver'
import * as field from '@web-system-service/interface/instance.resolver'
import * as schema from '@/modules/database/database.schema'
import * as enums from '@/modules/database/database.enums'
import * as plugin from '@/utils/utils-plugin'
import * as utils from '@/utils/utils-common'

@Injectable()
export class SystemRouterService extends Logger {
    constructor(private readonly database: DatabaseService, private readonly systemChunkService: SystemChunkService) {
        super()
    }

    /**新增菜单**/
    @AutoMethodDescriptor
    public async httpBaseSystemRouterCreate(request: OmixRequest, body: field.BaseSystemRouterCreate) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
            /**验证key重复**/
            await this.database.fetchConnectNull(this.database.schemaRouter, {
                request,
                deplayName: this.deplayName,
                message: `key:${body.key} 已存在`,
                dispatch: { where: { key: body.key } }
            })
            /**验证router重复**/
            await utils.fetchHandler(body.type === enums.COMMON_SYSTEM_ROUTER_TYPE.router.value, async () => {
                if (utils.isEmpty(body.router)) {
                    throw new HttpException(`router:菜单地址必填`, HttpStatus.BAD_REQUEST)
                }
                await this.database.fetchConnectNull(this.database.schemaRouter, {
                    request,
                    deplayName: this.deplayName,
                    message: `router:${body.router} 已存在`,
                    dispatch: { where: { router: body.router } }
                })
            })
            /**验证pid不存在**/
            await utils.fetchHandler(utils.isNotEmpty(body.pid), async () => {
                return await this.database.fetchConnectNotNull(this.database.schemaRouter, {
                    request,
                    deplayName: this.deplayName,
                    message: `pid:${body.pid} 不存在`,
                    dispatch: { where: { keyId: body.pid } }
                })
            })
            await this.database.fetchConnectCreate(ctx.manager.getRepository(schema.SchemaRouter), {
                request,
                deplayName: this.deplayName,
                body: Object.assign(body, { keyId: await utils.fetchIntNumber(), uid: request.user.uid })
            })
            return await ctx.commitTransaction().then(async () => {
                return await this.fetchResolver({ message: '新增成功' })
            })
        } catch (err) {
            await ctx.rollbackTransaction()
            return await this.fetchCatchCompiler(this.deplayName, err)
        } finally {
            await ctx.release()
        }
    }

    /**编辑菜单**/
    @AutoMethodDescriptor
    public async httpBaseSystemRouterUpdate(request: OmixRequest, body: field.BaseSystemRouterUpdate) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
            /**验证主键keyId不存在**/
            await this.database.fetchConnectNotNull(this.database.schemaRouter, {
                request,
                deplayName: this.deplayName,
                message: `keyId:${body.keyId} 不存在`,
                dispatch: { where: { keyId: body.keyId } }
            })
            /**验证key重复**/
            await this.database.fetchConnectNull(this.database.schemaRouter, {
                request,
                deplayName: this.deplayName,
                message: `key:${body.key} 已存在`,
                dispatch: { where: { key: body.key, keyId: Not(body.keyId) } }
            })
            /**验证router重复**/
            await utils.fetchHandler(body.type === enums.COMMON_SYSTEM_ROUTER_TYPE.router.value, async () => {
                if (utils.isEmpty(body.router)) {
                    throw new HttpException(`router:菜单地址必填`, HttpStatus.BAD_REQUEST)
                }
                await this.database.fetchConnectNull(this.database.schemaRouter, {
                    request,
                    deplayName: this.deplayName,
                    message: `router:${body.router} 已存在`,
                    dispatch: { where: { router: body.router, keyId: Not(body.keyId) } }
                })
            })
            await this.database.fetchConnectUpdate(ctx.manager.getRepository(schema.SchemaRouter), {
                request,
                deplayName: this.deplayName,
                where: { keyId: body.keyId },
                body: Object.assign(body, { uid: request.user.uid })
            })
            return await ctx.commitTransaction().then(async () => {
                return await this.fetchResolver({ message: '操作成功' })
            })
        } catch (err) {
            await ctx.rollbackTransaction()
            return await this.fetchCatchCompiler(this.deplayName, err)
        } finally {
            await ctx.release()
        }
    }

    /**编辑菜单状态**/
    @AutoMethodDescriptor
    public async httpBaseSystemSwitchRouter(request: OmixRequest, body: field.BaseSystemSwitchRouter) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
            const items = await this.database.fetchConnectBuilder(this.database.schemaRouter, async qb => {
                await qb.where(`t.keyId IN(:keys)`, { keys: body.keys })
                await this.database.fetchSelection(qb, [['t', ['id', 'keyId']]])
                return await qb.getManyAndCount().then(async ([list = [], total = 0]) => {
                    if (body.keys.length !== total) {
                        throw new HttpException('keyId不存在', HttpStatus.BAD_REQUEST, {
                            cause: body.keys.filter(key => !list.some(k => k.keyId == key))
                        })
                    }
                    return list.map(item => ({ id: item.id, status: body.status }))
                })
            })
            await this.database.fetchConnectUpsert(ctx.manager.getRepository(schema.SchemaRouter), {
                request,
                deplayName: this.deplayName,
                body: items
            })
            return await ctx.commitTransaction().then(async () => {
                return await this.fetchResolver({ message: '操作成功' })
            })
        } catch (err) {
            await ctx.rollbackTransaction()
            return await this.fetchCatchCompiler(this.deplayName, err)
        } finally {
            await ctx.release()
        }
    }

    /**删除菜单**/
    @AutoMethodDescriptor
    public async httpBaseSystemRouterDelete(request: OmixRequest, body: field.BaseSystemRouterResolver) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
            /**验证keyId合法性**/
            await this.database.fetchConnectNotNull(this.database.schemaRouter, {
                request,
                deplayName: this.deplayName,
                message: `keyId:${body.keyId} 不存在`,
                dispatch: { where: { keyId: body.keyId } }
            })
            /**提交删除事务操作**/
            await this.database.fetchConnectDelete(ctx.manager.getRepository(schema.SchemaRouter), {
                request,
                deplayName: this.deplayName,
                where: { keyId: body.keyId }
            })
            /**移除keyId对应的pid数据**/
            await this.database.fetchConnectUpdate(ctx.manager.getRepository(schema.SchemaRouter), {
                request,
                deplayName: this.deplayName,
                where: { pid: body.keyId },
                body: { pid: null, uid: request.user.uid }
            })
            return await ctx.commitTransaction().then(async () => {
                return await this.fetchResolver({ message: '操作成功' })
            })
        } catch (err) {
            await ctx.rollbackTransaction()
            return await this.fetchCatchCompiler(this.deplayName, err)
        } finally {
            await ctx.release()
        }
    }

    /**菜单列表**/
    @AutoMethodDescriptor
    public async httpBaseSystemColumnRouter(request: OmixRequest, body: field.BaseSystemColumnRouter) {
        try {
            return await this.database.fetchConnectBuilder(this.database.schemaRouter, async qb => {
                await qb.leftJoinAndMapOne('t.user', schema.SchemaUser, 'user', 'user.uid = t.uid')
                await this.database.fetchSelection(qb, [
                    ['t', ['uid', 'pid', 'key', 'name', 'router', 'active', 'check', 'iconName', 'sort', 'type', 'status', 'version']],
                    ['t', ['keyId', 'id', 'createTime', 'modifyTime']],
                    ['user', ['uid', 'name', 'status', 'id', 'number']]
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
                        return qb.andWhere('t.modifyTime >= :startTime AND t.modifyTime <= :endTime', {
                            startTime: body.startTime,
                            endTime: body.endTime
                        })
                    } else if (utils.isNotEmpty(body.startTime)) {
                        qb.andWhere('t.modifyTime >= :startTime', { startTime: body.startTime })
                    } else if (utils.isNotEmpty(body.endTime)) {
                        qb.andWhere('t.modifyTime <= :endTime', { endTime: body.endTime })
                    }
                })
                return await qb.getManyAndCount().then(async ([list = [], total = 0]) => {
                    const node = list.map(item => ({
                        ...item,
                        typeChunk: enums.COMMON_SYSTEM_ROUTER_TYPE[item.type],
                        statusChunk: enums.COMMON_SYSTEM_ROUTER_STATUS[item.status]
                    }))
                    return await this.fetchResolver({
                        message: '操作成功',
                        total,
                        list: utils.tree.fromList(node, { id: 'keyId', pid: 'pid' })
                    })
                })
            })
        } catch (err) {
            return await this.fetchCatchCompiler(this.deplayName, err)
        }
    }

    /**菜单列表树**/
    @AutoMethodDescriptor
    public async httpBaseColumnTreeSystemRouter(request: OmixRequest) {
        try {
            return await this.database.fetchConnectBuilder(this.database.schemaRouter, async qb => {
                await this.database.fetchSelection(qb, [['t', ['keyId', 'id', 'pid', 'name', 'sort', 'type']]])
                await qb.where('t.type = :type', { type: 'router' })
                await qb.orderBy({ 't.sort': 'ASC' })
                return await qb.getMany().then(async data => {
                    return await this.fetchResolver({
                        list: utils.fetchRemoveTreeNode(utils.tree.fromList(data, { id: 'keyId', pid: 'pid' }))
                    })
                })
            })
        } catch (err) {
            return await this.fetchCatchCompiler(this.deplayName, err)
        }
    }

    /**获取当前用户菜单**/
    @AutoMethodDescriptor
    public async httpBaseSystemUserRouter(request: OmixRequest) {
        try {
            return await this.database.fetchConnectBuilder(this.database.schemaRouter, async qb => {
                await qb.where('t.type = :type', { type: enums.COMMON_SYSTEM_ROUTER_TYPE.router.value })
                await this.database.fetchSelection(qb, [
                    ['t', ['keyId', 'pid', 'key', 'name', 'router', 'active', 'check']],
                    ['t', ['iconName', 'type', 'status', 'version']]
                ])
                return await qb.getMany().then(async data => {
                    return await this.fetchResolver({
                        list: utils.fetchRemoveTreeNode(utils.tree.fromList(data, { id: 'keyId', pid: 'pid' }))
                    })
                })
            })
        } catch (err) {
            return await this.fetchCatchCompiler(this.deplayName, err)
        }
    }

    /**菜单详情**/
    @AutoMethodDescriptor
    public async httpBaseSystemRouterResolver(request: OmixRequest, body: field.BaseSystemRouterResolver) {
        try {
            return await this.database.fetchConnectNotNull(this.database.schemaRouter, {
                deplayName: this.deplayName,
                request,
                message: `keyId:${body.keyId} 不存在`,
                dispatch: { where: { keyId: body.keyId } }
            })
        } catch (err) {
            return await this.fetchCatchCompiler(this.deplayName, err)
        }
    }
}
