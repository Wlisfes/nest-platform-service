import { Injectable } from '@nestjs/common'
import { Not } from 'typeorm'
import { Logger, AutoMethodDescriptor } from '@/modules/logger/logger.service'
import { DatabaseService } from '@/modules/database/database.service'
import {} from '@web-system-service/modules/system/system-chunk.service'
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

    /**新增角色**/
    @AutoMethodDescriptor
    public async httpBaseCreateSystemRole(request: OmixRequest, body: field.BaseCreateSystemRole) {
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
    public async httpBaseUpdateSystemRole(request: OmixRequest, body: field.BaseUpdateSystemRole) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
            await this.database.fetchConnectNotNull(this.database.schemaRole, {
                deplayName: this.deplayName,
                request,
                message: `keyId:${body.keyId} 不存在`,
                dispatch: { where: { keyId: body.keyId } }
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
    public async httpBaseUpdateStateSystemRole(request: OmixRequest, body: field.BaseStateSystemRole) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
            await this.database.fetchConnectNotNull(this.database.schemaRole, {
                deplayName: this.deplayName,
                request,
                message: `keyId:${body.keyId} 不存在`,
                dispatch: { where: { keyId: body.keyId } }
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

    /**编辑角色**/
    @AutoMethodDescriptor
    public async httpBaseUpdateSystemRoleAuthorize(request: OmixRequest, body: field.BaseUpdateSystemRoleAuthorize) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
            await this.database.fetchConnectNotNull(this.database.schemaRole, {
                deplayName: this.deplayName,
                request,
                message: `keyId:${body.keyId} 不存在`,
                dispatch: { where: { keyId: body.keyId } }
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

    /**编辑角色用户**/
    @AutoMethodDescriptor
    public async httpBaseUpdateSystemRoleUser(request: OmixRequest, body: field.BaseUpdateSystemRoleUser) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
            await this.database.fetchConnectNotNull(this.database.schemaRole, {
                deplayName: this.deplayName,
                request,
                message: `keyId:${body.keyId} 不存在`,
                dispatch: { where: { keyId: body.keyId } }
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

    /**角色列表**/
    @AutoMethodDescriptor
    public async httpBaseColumnSystemRole(request: OmixRequest, body: field.BaseColumnSystemRole) {
        try {
            return await this.database.fetchConnectBuilder(this.database.schemaRole, async qb => {
                await qb.leftJoinAndMapOne('t.user', schema.SchemaUser, 'user', 'user.uid = t.uid')
                await this.database.fetchSelection(qb, [
                    ['t', ['id', 'keyId', 'name', 'uid', 'uids', 'auxs', 'status', 'createTime', 'modifyTime']],
                    ['user', ['uid', 'name', 'status', 'id', 'number']]
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
                        list: list.map(item => ({ ...item, statusChunk: enums.COMMON_SYSTEM_ROLE_STATUS[item.status] }))
                    })
                })
            })
        } catch (err) {
            return await this.fetchCatchCompiler(this.deplayName, err)
        }
    }
}
