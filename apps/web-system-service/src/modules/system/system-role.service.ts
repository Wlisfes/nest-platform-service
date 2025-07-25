import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Not, IsNull } from 'typeorm'
import { Logger, AutoMethodDescriptor } from '@/modules/logger/logger.service'
import { DatabaseService } from '@/modules/database/database.service'
import { Omix, OmixRequest, OmixBaseOptions } from '@/interface/instance.resolver'
import { SystemRouterService } from '@web-system-service/modules/system/system-router.service'
import { tree, omit, fetchTreeNodeDelete } from '@/utils/utils-common'
import * as field from '@web-system-service/interface/instance.resolver'
import * as schema from '@/modules/database/database.schema'
import * as enums from '@/modules/database/database.enums'
import * as plugin from '@/utils/utils-plugin'
import * as utils from '@/utils/utils-common'

@Injectable()
export class SystemRoleService extends Logger {
    constructor(private readonly database: DatabaseService, private readonly systemRouterService: SystemRouterService) {
        super()
    }

    /**验证keyId是否存在：不存在抛出异常**/
    @AutoMethodDescriptor
    private async fetchBaseSystemCheckKeyIdRole(request: OmixRequest, body: OmixBaseOptions<{ keyId: string }>) {
        return await this.database.fetchConnectNotNull(this.database.schemaRole, {
            request,
            deplayName: this.fetchDeplayName(body.deplayName),
            message: body.message || `keyId:${body.where.keyId} 不存在`,
            dispatch: { where: body.where }
        })
    }

    /**新增角色**/
    @AutoMethodDescriptor
    public async httpBaseSystemRoleCreate(request: OmixRequest, body: field.BaseSystemRoleCreate) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
            await this.database.fetchConnectNull(this.database.schemaRole, {
                deplayName: this.deplayName,
                request,
                message: `name:${body.name} 已存在`,
                dispatch: { where: { name: body.name } }
            })
            await this.database.fetchConnectCreate(ctx.manager.getRepository(schema.SchemaRole), {
                deplayName: this.deplayName,
                request,
                body: Object.assign(body, {
                    dept: false,
                    keyId: await utils.fetchIntNumber(),
                    uid: request.user.uid,
                    model: enums.COMMON_SYSTEM_ROLE_MODEL.self_member.value
                })
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

    /**编辑角色**/
    @AutoMethodDescriptor
    public async httpBaseSystemRoleUpdate(request: OmixRequest, body: field.BaseSystemRoleUpdate) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
            await this.fetchBaseSystemCheckKeyIdRole(request, {
                deplayName: this.deplayName,
                where: { keyId: body.keyId }
            })
            await this.database.fetchConnectNull(this.database.schemaRole, {
                deplayName: this.deplayName,
                request,
                message: `name:${body.name} 已存在`,
                dispatch: { where: { name: body.name, keyId: Not(body.keyId) } }
            })
            await this.database.fetchConnectUpdate(ctx.manager.getRepository(schema.SchemaRole), {
                deplayName: this.deplayName,
                request,
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

    /**编辑角色数据权限**/
    @AutoMethodDescriptor
    public async httpBaseSystemRoleModelUpdate(request: OmixRequest, body: field.BaseSystemRoleModelUpdate) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
            await this.fetchBaseSystemCheckKeyIdRole(request, {
                deplayName: this.deplayName,
                where: { keyId: body.keyId }
            })
            await this.database.fetchConnectUpdate(ctx.manager.getRepository(schema.SchemaRole), {
                deplayName: this.deplayName,
                request,
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

    /**删除角色**/
    @AutoMethodDescriptor
    public async httpBaseSystemRoleDelete(request: OmixRequest, body: field.BaseSystemRoleResolver) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
            await this.fetchBaseSystemCheckKeyIdRole(request, {
                deplayName: this.deplayName,
                where: { keyId: body.keyId }
            })
            /**删除角色关联用户**/
            await this.database.fetchConnectDelete(ctx.manager.getRepository(schema.SchemaRoleUser), {
                deplayName: this.deplayName,
                request,
                where: { keyId: body.keyId }
            })
            /**删除角色关联权限**/
            await this.database.fetchConnectDelete(ctx.manager.getRepository(schema.SchemaRoleRouter), {
                deplayName: this.deplayName,
                request,
                where: { keyId: body.keyId }
            })
            /**删除角色**/
            await this.database.fetchConnectDelete(ctx.manager.getRepository(schema.SchemaRole), {
                deplayName: this.deplayName,
                request,
                where: { keyId: body.keyId }
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

    /**角色详情信息**/
    @AutoMethodDescriptor
    public async httpBaseSystemRoleResolver(request: OmixRequest, body: field.BaseSystemRoleResolver) {
        try {
            return await this.fetchBaseSystemCheckKeyIdRole(request, {
                deplayName: this.deplayName,
                where: { keyId: body.keyId }
            })
        } catch (err) {
            return await this.fetchCatchCompiler(this.deplayName, err)
        }
    }

    /**所有角色配置**/
    @AutoMethodDescriptor
    public async httpBaseSystemColumnRoleWhole(request: OmixRequest) {
        try {
            return await this.database.fetchConnectBuilder(this.database.schemaRole, async qb => {
                await qb.leftJoinAndMapOne('t.node', schema.SchemaDept, 'node', 'node.keyId = t.keyId')
                await this.database.fetchSelection(qb, [
                    ['t', ['id', 'keyId', 'name', 'model', 'status', 'dept']],
                    ['node', ['keyId', 'pid']]
                ])
                return await qb.getMany().then(async list => {
                    const items = list.filter(item => item.dept).map((item: Omix) => ({ pid: item.node.pid, ...omit(item, ['node']) }))
                    return await this.fetchResolver({
                        list: list.filter(item => !item.dept),
                        items: fetchTreeNodeDelete(tree.fromList(items, { id: 'keyId', pid: 'pid' }))
                    })
                })
            })
        } catch (err) {
            return await this.fetchCatchCompiler(this.deplayName, err)
        }
    }

    /**角色关联用户列表**/
    @AutoMethodDescriptor
    public async httpBaseSystemJoinColumnRoleUser(request: OmixRequest, body: field.BaseSystemJoinColumnRoleUser) {
        try {
            return await this.database.fetchConnectBuilder(this.database.schemaRoleUser, async qb => {
                await qb.leftJoinAndMapOne('t.user', schema.SchemaUser, 'user', 't.uid = user.uid')
                await this.database.fetchSelection(qb, [
                    ['t', ['id', 'keyId', 'uid', 'createTime', 'modifyTime']],
                    ['user', ['uid', 'name', 'number', 'avatar', 'status']]
                ])
                await qb.where(`t.keyId = :keyId`, { keyId: body.keyId })
                await this.database.fetchBrackets(utils.isNotEmpty(body.vague), function () {
                    return qb.andWhere(`user.name LIKE :vague OR user.number LIKE :vague`, { vague: `%${body.vague}%` })
                })
                await qb.orderBy({ 't.id': 'DESC' })
                await qb.offset((body.page - 1) * body.size)
                await qb.limit(body.size)
                return await qb.getManyAndCount().then(async ([list = [], total = 0]) => {
                    return await this.fetchResolver({ message: '操作成功', total, list })
                })
            })
        } catch (err) {
            return await this.fetchCatchCompiler(this.deplayName, err)
        }
    }

    /**角色关联用户**/
    @AutoMethodDescriptor
    public async httpBaseSystemJoinRoleUser(request: OmixRequest, body: field.BaseSystemJoinRoleUser) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
            await this.database.fetchConnectNull(this.database.schemaRoleUser, {
                request,
                deplayName: this.deplayName,
                message: '员工已关联角色',
                dispatch: { where: { keyId: body.keyId, uid: body.uid } }
            })
            await this.database.fetchConnectCreate(ctx.manager.getRepository(schema.SchemaRoleUser), {
                deplayName: this.deplayName,
                request,
                body: body
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

    /**移除角色关联用户**/
    @AutoMethodDescriptor
    public async httpBaseSystemJoinRoleUserDelete(request: OmixRequest, body: field.BaseSystemJoinRoleUser) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
            await this.database.fetchConnectNotNull(this.database.schemaRoleUser, {
                request,
                deplayName: this.deplayName,
                message: '员工未存在关联角色',
                dispatch: { where: body }
            })
            await this.database.fetchConnectDelete(ctx.manager.getRepository(schema.SchemaRoleUser), {
                deplayName: this.deplayName,
                request,
                where: body
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

    /**角色关联菜单列表**/
    @AutoMethodDescriptor
    public async httpBaseSystemJoinColumnRoleRouter(request: OmixRequest, body: field.BaseSystemRoleResolver) {
        try {
            return await this.systemRouterService.httpBaseSystemTreeRouter(request).then(async (data: Omix) => {
                return await this.database.fetchConnectBuilder(this.database.schemaRoleRouter, async qb => {
                    await qb.where(`t.keyId = :keyId`, { keyId: body.keyId })
                    await this.database.fetchSelection(qb, [['t', ['id', 'keyId', 'sid']]])
                    return await qb.getMany().then(async list => {
                        const items = utils.tree.findNodeAll(data.list, item => utils.isEmpty(item.children)).map(item => item.keyId)
                        const keys = list.filter(item => items.includes(item.sid)).map(item => item.sid)
                        return await this.fetchResolver({
                            message: '操作成功',
                            keys,
                            next: list.map(item => item.sid) as never
                        })
                    })
                })
            })
        } catch (err) {
            return await this.fetchCatchCompiler(this.deplayName, err)
        }
    }

    /**角色关联菜单**/
    @AutoMethodDescriptor
    public async httpBaseSystemJoinRoleRouter(request: OmixRequest, body: field.BaseSystemJoinRoleRouter) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
            await this.fetchBaseSystemCheckKeyIdRole(request, {
                deplayName: this.deplayName,
                where: { keyId: body.keyId }
            })
            /**验证权限keyId合法性**/
            await this.database.fetchConnectBatchNotNull(this.database.schemaRouter, {
                request,
                deplayName: this.deplayName,
                keys: body.keys
            })
            /**删除旧数据**/
            await this.database.fetchConnectDelete(ctx.manager.getRepository(schema.SchemaRoleRouter), {
                request,
                deplayName: this.deplayName,
                where: { keyId: body.keyId }
            })
            /**存储新数据**/
            await this.database.fetchConnectInsert(ctx.manager.getRepository(schema.SchemaRoleRouter), {
                request,
                deplayName: this.deplayName,
                body: body.keys.map(sid => ({ sid, keyId: body.keyId }))
            })
            /**修改最后更新人**/
            await this.database.fetchConnectUpdate(ctx.manager.getRepository(schema.SchemaRole), {
                request,
                deplayName: this.deplayName,
                where: { keyId: body.keyId },
                body: { uid: request.user.uid }
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
}
