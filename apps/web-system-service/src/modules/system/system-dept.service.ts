import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Not } from 'typeorm'
import { Logger, AutoMethodDescriptor } from '@/modules/logger/logger.service'
import { DatabaseService } from '@/modules/database/database.service'
import { Omix, OmixRequest, OmixBaseOptions } from '@/interface/instance.resolver'
import { fetchHandler, fetchIntNumber, isEmpty, isNotEmpty, fetchTreeNodeDelete, tree } from '@/utils/utils-common'
import * as field from '@web-system-service/interface/instance.resolver'
import * as schema from '@/modules/database/database.schema'
import * as enums from '@/modules/database/database.enums'
import * as plugin from '@/utils/utils-plugin'

@Injectable()
export class SystemDeptService extends Logger {
    constructor(private readonly database: DatabaseService) {
        super()
    }

    /**新增部门**/
    @AutoMethodDescriptor
    public async httpBaseSystemDeptCreate(request: OmixRequest, body: field.BaseSystemDeptCreate) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
            await this.database.fetchConnectNull(this.database.schemaDept, {
                request,
                comment: `验证部门名称是否重复:[${body.name}]`,
                deplayName: this.deplayName,
                message: `name:${body.name} 已存在`,
                dispatch: { where: { name: body.name } }
            })
            await this.database.fetchConnectNull(this.database.schemaDept, {
                request,
                comment: `验证部门简称是否重复:[${body.bit}]`,
                deplayName: this.deplayName,
                next: isNotEmpty(body.bit),
                message: `bit:${body.bit} 已存在`,
                dispatch: { where: { bit: body.bit } }
            })
            await this.database.fetchConnectNotNull(this.database.schemaDept, {
                request,
                comment: `验证上级部门ID是否错误:[${body.pid}]`,
                deplayName: this.deplayName,
                next: isNotEmpty(body.pid),
                message: `pid:${body.pid} 不存在`,
                dispatch: { where: { keyId: body.pid } }
            })
            const { keyId } = await this.database.fetchConnectCreate(ctx.manager.getRepository(schema.SchemaDept), {
                request,
                comment: `新增部门:[${body.name}]`,
                deplayName: this.deplayName,
                body: Object.assign(body, { keyId: await fetchIntNumber(), uid: request.user.uid })
            })
            await this.database.fetchConnectCreate(ctx.manager.getRepository(schema.SchemaRole), {
                request,
                comment: `新增部门关联角色:[${body.name}]`,
                deplayName: this.deplayName,
                body: {
                    keyId,
                    dept: true,
                    name: body.name,
                    uid: request.user.uid,
                    model: enums.COMMON_SYSTEM_ROLE_MODEL.self_member.value,
                    status: enums.COMMON_SYSTEM_ROLE_STATUS.enable.value
                }
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

    /**编辑部门**/
    @AutoMethodDescriptor
    public async httpBaseSystemDeptUpdate(request: OmixRequest, body: field.BaseSystemDeptUpdate) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
            await this.database.fetchConnectNotNull(this.database.schemaDept, {
                request,
                comment: `验证部门ID是否错误[${body.keyId}]`,
                deplayName: this.deplayName,
                message: `keyId:${body.keyId} 不存在`,
                dispatch: { where: { keyId: body.keyId } }
            })
            await this.database.fetchConnectNull(this.database.schemaDept, {
                request,
                comment: `验证部门名称是否重复:[${body.name}]`,
                deplayName: this.deplayName,
                message: `name:${body.name} 已存在`,
                dispatch: { where: { name: body.name, keyId: Not(body.keyId) } }
            })
            await this.database.fetchConnectNull(this.database.schemaDept, {
                request,
                comment: `验证部门简称是否重复:[${body.bit}]`,
                deplayName: this.deplayName,
                next: isNotEmpty(body.bit),
                message: `bit:${body.bit} 已存在`,
                dispatch: { where: { bit: body.bit, keyId: Not(body.keyId) } }
            })
            await this.database.fetchConnectNotNull(this.database.schemaDept, {
                request,
                comment: `验证上级部门ID是否错误:[${body.pid}]`,
                deplayName: this.deplayName,
                next: isNotEmpty(body.pid),
                message: `pid:${body.pid} 不存在`,
                dispatch: { where: { keyId: body.pid } }
            })
            await this.database.fetchConnectUpdate(ctx.manager.getRepository(schema.SchemaDept), {
                request,
                comment: `编辑部门:[${body.name}]`,
                deplayName: this.deplayName,
                where: { keyId: body.keyId },
                body: Object.assign(body, { uid: request.user.uid })
            })
            await this.database.fetchConnectUpdate(ctx.manager.getRepository(schema.SchemaRole), {
                request,
                comment: `编辑部门关联角色:[${body.name}]`,
                deplayName: this.deplayName,
                where: { keyId: body.keyId },
                body: { name: body.name, uid: request.user.uid }
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

    /**删除部门**/
    @AutoMethodDescriptor
    public async httpBaseSystemDeptDelete(request: OmixRequest, body: field.BaseSystemDeptResolver) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
            await this.database.fetchConnectNotNull(this.database.schemaDept, {
                request,
                comment: `验证部门ID是否错误:[${body.keyId}]`,
                deplayName: this.deplayName,
                message: `keyId:${body.keyId} 不存在`,
                dispatch: { where: { keyId: body.keyId } }
            })
            await this.database.fetchConnectDelete(ctx.manager.getRepository(schema.SchemaDept), {
                request,
                comment: `删除部门:[${body.keyId}]`,
                deplayName: this.deplayName,
                where: { keyId: body.keyId }
            })
            await this.database.fetchConnectDelete(ctx.manager.getRepository(schema.SchemaDeptUser), {
                request,
                comment: `删除部门绑定的用户关系:[${body.keyId}]`,
                deplayName: this.deplayName,
                where: { keyId: body.keyId }
            })
            await this.database.fetchConnectDelete(ctx.manager.getRepository(schema.SchemaRole), {
                request,
                comment: `删除部门关联角色:[${body.keyId}]`,
                deplayName: this.deplayName,
                where: { keyId: body.keyId }
            })
            await this.database.fetchConnectDelete(ctx.manager.getRepository(schema.SchemaRoleUser), {
                request,
                comment: `删除部门关联角色绑定的用户关系`,
                deplayName: this.deplayName,
                where: { keyId: body.keyId }
            })
            await this.database.fetchConnectDelete(ctx.manager.getRepository(schema.SchemaRoleRouter), {
                request,
                comment: `删除部门关联角色绑定的菜单资源权限`,
                deplayName: this.deplayName,
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

    /**完整部门树列表**/
    @AutoMethodDescriptor
    public async httpBaseSystemDeptCascader(request: OmixRequest) {
        try {
            return await this.database.fetchConnectBuilder(this.database.schemaDept, async qb => {
                await this.database.fetchSelection(qb, [['t', ['keyId', 'pid', 'bit', 'name']]])
                return await qb.getManyAndCount().then(async ([list = [], total = 0]) => {
                    return await this.fetchResolver({
                        total,
                        list: fetchTreeNodeDelete(tree.fromList(list, { id: 'keyId', pid: 'pid' }))
                    })
                })
            })
        } catch (err) {
            return await this.fetchCatchCompiler(this.deplayName, err)
        }
    }

    /**部门列表**/
    @AutoMethodDescriptor
    public async httpBaseSystemDeptColumn(request: OmixRequest) {
        try {
            return await this.database.fetchConnectBuilder(this.database.schemaDept, async qb => {
                await qb.leftJoinAndMapOne('t.user', schema.SchemaUser, 'user', 'user.uid = t.uid')
                await qb.leftJoinAndMapMany('t.items', schema.SchemaDeptUser, 'items', 'items.keyId = t.keyId')
                await this.database.fetchSelection(qb, [
                    ['t', ['keyId', 'uid', 'pid', 'bit', 'name', 'createTime', 'modifyTime']],
                    ['user', ['uid', 'name', 'status', 'id', 'number']],
                    ['items', ['keyId', 'uid']]
                ])
                await qb.where(`t.pid IS NOT NULL`)
                await qb.orderBy({ 't.id': 'ASC' })
                return await qb.getManyAndCount().then(async ([list = [], total = 0]) => {
                    return await this.fetchResolver({
                        total,
                        list: fetchTreeNodeDelete(tree.fromList(list, { id: 'keyId', pid: 'pid' }))
                    })
                })
            })
        } catch (err) {
            return await this.fetchCatchCompiler(this.deplayName, err)
        }
    }

    /**关联用户**/
    @AutoMethodDescriptor
    public async httpBaseSystemJoinDeptUser(request: OmixRequest, body: field.BaseSystemJoinDeptUser) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
            await this.database.fetchConnectNotNull(this.database.schemaDept, {
                request,
                comment: `验证部门ID是否错误:[${body.keyId}]`,
                deplayName: this.deplayName,
                message: `keyId:${body.keyId} 不存在`,
                dispatch: { where: { keyId: body.keyId } }
            })
            await this.database.fetchConnectNotNull(this.database.schemaUser, {
                request,
                comment: `验证用户ID是否错误:[${body.uid}]`,
                deplayName: this.deplayName,
                message: `uid:${body.uid} 不存在`,
                dispatch: { where: { uid: body.uid } }
            })
            return await this.database.fetchConnectBuilder(this.database.schemaDeptUser, async qb => {
                await qb.where(`t.keyId = :keyId AND t.uid = :uid`, body)
                return await qb.getOne().then(async data => {
                    await this.database.fetchConnectCreate(ctx.manager.getRepository(schema.SchemaDeptUser), {
                        request,
                        comment: `部门关联用户:[${body.uid}]`,
                        next: isEmpty(data),
                        deplayName: this.deplayName,
                        body: body
                    })
                    return await ctx.commitTransaction().then(async () => {
                        return await this.fetchResolver({ message: '操作成功' })
                    })
                })
            })
        } catch (err) {
            await ctx.rollbackTransaction()
            return await this.fetchCatchCompiler(this.deplayName, err)
        } finally {
            await ctx.release()
        }
    }
}
