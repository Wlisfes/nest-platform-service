import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Not } from 'typeorm'
import { Logger, AutoMethodDescriptor } from '@/modules/logger/logger.service'
import { DatabaseService } from '@/modules/database/database.service'
import { Omix, OmixRequest } from '@/interface/instance.resolver'
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
    private async fetchBaseSystemCheckKeyIdRole(request: OmixRequest, body: field.BaseSystemCheckKeyIdRole) {
        return await this.database.fetchConnectNotNull(this.database.schemaRole, {
            request,
            deplayName: this.fetchDeplayName(body.deplayName),
            message: body.message || `keyId:${body.keyId} 不存在`,
            dispatch: { where: { keyId: body.keyId } }
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

    /**编辑角色**/
    @AutoMethodDescriptor
    public async httpBaseSystemRoleUpdate(request: OmixRequest, body: field.BaseSystemRoleUpdate) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
            await this.fetchBaseSystemCheckKeyIdRole(request, {
                keyId: body.keyId,
                deplayName: this.deplayName
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

    /**编辑角色状态**/
    @AutoMethodDescriptor
    public async httpBaseSystemSwitchRole(request: OmixRequest, body: field.BaseSystemSwitchRole) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
            await this.fetchBaseSystemCheckKeyIdRole(request, {
                keyId: body.keyId,
                deplayName: this.deplayName
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
                keyId: body.keyId,
                deplayName: this.deplayName
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

    /**编辑角色用户**/
    @AutoMethodDescriptor
    public async httpBaseSystemUpdateRoleUser(request: OmixRequest, body: field.BaseSystemUpdateRoleUser) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
            await this.fetchBaseSystemCheckKeyIdRole(request, {
                keyId: body.keyId,
                deplayName: this.deplayName
            })
            /**验证用户uid合法性**/
            await this.database.fetchConnectBatchNotNull(this.database.schemaUser, {
                alias: 'uid',
                deplayName: this.deplayName,
                request,
                keys: body.keys
            })
            /**删除旧数据**/
            await this.database.fetchConnectDelete(ctx.manager.getRepository(schema.SchemaRoleUser), {
                deplayName: this.deplayName,
                request,
                where: { keyId: body.keyId }
            })
            /**存储新数据**/
            await this.database.fetchConnectInsert(ctx.manager.getRepository(schema.SchemaRoleUser), {
                deplayName: this.deplayName,
                request,
                body: body.keys.map(uid => ({ uid, keyId: body.keyId }))
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

    /**角色列表**/
    @AutoMethodDescriptor
    public async httpBaseSystemColumnRole(request: OmixRequest, body: field.BaseSystemColumnRole) {
        try {
            return await this.database.fetchConnectBuilder(this.database.schemaRole, async qb => {
                qb.leftJoinAndMapOne('t.user', schema.SchemaUser, 'user', 'user.uid = t.uid')
                qb.leftJoinAndMapMany('t.mumber', schema.SchemaRoleUser, 'mumber', 'mumber.keyId = t.keyId')
                await this.database.fetchSelection(qb, [
                    ['t', ['id', 'keyId', 'name', 'uid', 'status', 'model', 'comment', 'createTime', 'modifyTime']],
                    ['user', ['uid', 'name', 'status', 'id', 'number']],
                    ['mumber', ['keyId', 'uid']]
                ])
                await this.database.fetchBrackets(utils.isNotEmpty(body.vague), function () {
                    return qb.where(`t.keyId LIKE :vague OR t.name LIKE :vague`, { vague: `%${body.vague}%` })
                })
                await this.database.fetchBrackets(utils.isNotEmpty(body.name), () => {
                    return qb.andWhere('t.name = :name', { name: body.name })
                })
                await this.database.fetchBrackets(utils.isNotEmpty(body.status), () => {
                    return qb.andWhere('t.status = :status', { status: body.status })
                })
                await this.database.fetchBrackets(utils.isNotEmpty(body.uid), () => {
                    return qb.andWhere('t.uid = :uid', { uid: body.uid })
                })
                await qb.orderBy({ 't.id': 'DESC' })
                await qb.offset((body.page - 1) * body.size)
                await qb.limit(body.size)
                return await qb.getManyAndCount().then(async ([list = [], total = 0]) => {
                    return await this.fetchResolver({
                        message: '操作成功',
                        total,
                        list: utils.fetchConcat(list, item => ({
                            mumber: item.mumber.length,
                            statusChunk: enums.COMMON_SYSTEM_ROLE_STATUS[item.status]
                        }))
                    })
                })
            })
        } catch (err) {
            return await this.fetchCatchCompiler(this.deplayName, err)
        }
    }

    /**删除角色**/
    @AutoMethodDescriptor
    public async httpBaseSystemRoleDelete(request: OmixRequest, body: field.BaseSystemRoleResolver) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
            await this.fetchBaseSystemCheckKeyIdRole(request, {
                keyId: body.keyId,
                deplayName: this.deplayName
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
            await this.fetchBaseSystemCheckKeyIdRole(request, {
                keyId: body.keyId,
                deplayName: this.deplayName
            })
            return await this.database.fetchConnectBuilder(this.database.schemaRole, async qb => {
                qb.leftJoinAndMapMany('t.mumber', schema.SchemaRoleUser, 'mumber', 'mumber.keyId = t.keyId')
                qb.leftJoinAndMapOne('mumber.user', schema.SchemaUser, 'user', 'user.uid = mumber.uid')
                qb.where(`t.keyId = :keyId`, { keyId: body.keyId })
                await this.database.fetchSelection(qb, [
                    ['t', ['keyId', 'name', 'uid']],
                    ['mumber', ['keyId', 'uid']],
                    ['user', ['uid', 'name', 'number', 'avatar']]
                ])
                return await qb.getOne()
            })
        } catch (err) {
            return await this.fetchCatchCompiler(this.deplayName, err)
        }
    }
}
