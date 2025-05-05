import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Not, IsNull } from 'typeorm'
import { Logger, AutoMethodDescriptor } from '@/modules/logger/logger.service'
import { DatabaseService } from '@/modules/database/database.service'
import { Omix, OmixRequest, OmixBaseOptions } from '@/interface/instance.resolver'
import * as field from '@web-system-service/interface/instance.resolver'
import * as schema from '@/modules/database/database.schema'
import * as enums from '@/modules/database/database.enums'
import * as plugin from '@/utils/utils-plugin'
import * as utils from '@/utils/utils-common'

@Injectable()
export class SystemRoleService extends Logger {
    constructor(private readonly database: DatabaseService) {
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

    /**编辑角色权限规则**/
    @AutoMethodDescriptor
    public async httpBaseSystemUpdateRoleRules(request: OmixRequest, body: field.BaseSystemUpdateRoleRules) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
            await this.fetchBaseSystemCheckKeyIdRole(request, {
                deplayName: this.deplayName,
                where: { keyId: body.keyId }
            })
            /**验证权限keyId合法性**/
            await this.database.fetchConnectBatchNotNull(this.database.schemaRouter, {
                deplayName: this.deplayName,
                request,
                keys: body.keys
            })
            /**删除旧数据**/
            await this.database.fetchConnectDelete(ctx.manager.getRepository(schema.SchemaRoleRouter), {
                deplayName: this.deplayName,
                request,
                where: { keyId: body.keyId }
            })
            /**存储新数据**/
            await this.database.fetchConnectInsert(ctx.manager.getRepository(schema.SchemaRoleRouter), {
                deplayName: this.deplayName,
                request,
                body: body.keys.map(sid => ({ sid, keyId: body.keyId }))
            })
            /**修改最后更新人**/
            await this.database.fetchConnectUpdate(ctx.manager.getRepository(schema.SchemaRole), {
                deplayName: this.deplayName,
                request,
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

    /**所有角色配置**/
    @AutoMethodDescriptor
    public async httpBaseSystemColumnRoleWhole(request: OmixRequest) {
        try {
            return await this.database.fetchConnectBuilder(this.database.schemaDept, async qb => {
                qb.leftJoinAndMapOne('t.post', schema.SchemaRole, 'post', 'post.deptId = t.keyId')
                qb.where('t.pid IS NOT NULL')
                await this.database.fetchSelection(qb, [
                    ['t', ['id', 'keyId', 'name', 'pid']],
                    ['post', ['id', 'keyId', 'deptId', 'name', 'model', 'status']]
                ])
                return await qb.getMany().then(async items => {
                    return {
                        items: utils.fetchTreeNodeDelete(utils.tree.fromList(items, { id: 'keyId', pid: 'pid' })),
                        list: await this.database.schemaRole.find({
                            where: { deptId: IsNull() },
                            select: ['id', 'keyId', 'deptId', 'name', 'model', 'status']
                        })
                    }
                })
            })
        } catch (err) {
            return await this.fetchCatchCompiler(this.deplayName, err)
        }
    }

    /**角色关联用户列表**/
    @AutoMethodDescriptor
    public async httpBaseSystemColumnRoleUser(request: OmixRequest, body: field.BaseSystemColumnRoleUser) {
        try {
            return await this.database.fetchConnectBuilder(this.database.schemaRoleUser, async qb => {
                await qb.leftJoinAndMapOne('t.user', schema.SchemaUser, 'user', 't.uid = user.uid')
                await qb.where(`t.keyId = :keyId`, { keyId: body.keyId })
                await this.database.fetchSelection(qb, [
                    ['t', ['id', 'keyId', 'uid', 'createTime', 'modifyTime']],
                    ['user', ['uid', 'name', 'number', 'avatar', 'status']]
                ])
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
}
