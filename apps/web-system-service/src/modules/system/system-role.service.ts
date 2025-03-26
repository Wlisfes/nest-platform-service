import { Injectable } from '@nestjs/common'
import { Not } from 'typeorm'
import { Logger } from '@/modules/logger/logger.service'
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

    /**新增角色权限**/
    public async httpBaseCreateSystemRole(request: OmixRequest, body: field.BaseCreateSystemRole) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
            await this.database.fetchConnectNull(this.database.schemaRole, {
                message: `name:${body.name} 已存在`,
                dispatch: { where: { name: body.name } }
            })
            await this.database.fetchConnectCreate(this.database.schemaRole, {
                body: Object.assign(body, { keyId: await utils.fetchIntNumber(), uid: request.user.uid })
            })
            return await ctx.commitTransaction().then(async () => {
                return await this.fetchResolver({ message: '新增成功' })
            })
        } catch (err) {
            await ctx.rollbackTransaction()
            return await this.fetchCatchCompiler('SystemRoleService:httpBaseCreateSystemRole', err)
        } finally {
            await ctx.release()
        }
    }

    /**编辑角色**/
    public async httpBaseUpdateSystemRole(request: OmixRequest, body: field.BaseUpdateSystemRole) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
            await this.database.fetchConnectNotNull(this.database.schemaRole, {
                message: `keyId:${body.keyId} 不存在`,
                dispatch: { where: { keyId: body.keyId } }
            })
            await this.database.fetchConnectNull(this.database.schemaRole, {
                message: `name:${body.name} 已存在`,
                dispatch: { where: { name: body.name, keyId: Not(body.keyId) } }
            })
            await this.database.fetchConnectUpdate(this.database.schemaRole, {
                where: { keyId: body.keyId },
                body: Object.assign(body, { uid: request.user.uid })
            })
            return await ctx.commitTransaction().then(async () => {
                return await this.fetchResolver({ message: '操作成功' })
            })
        } catch (err) {
            await ctx.rollbackTransaction()
            return await this.fetchCatchCompiler('SystemRoleService:httpBaseUpdateSystemRole', err)
        } finally {
            await ctx.release()
        }
    }

    /**编辑角色状态**/
    public async httpBaseUpdateSwitchSystemRole(request: OmixRequest, body: field.BaseSwitchSystemRole) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
            await this.database.fetchConnectNotNull(this.database.schemaRole, {
                message: `keyId:${body.keyId} 不存在`,
                dispatch: { where: { keyId: body.keyId } }
            })
            await this.database.fetchConnectUpdate(this.database.schemaRole, {
                where: { keyId: body.keyId },
                body: { status: body.status, uid: request.user.uid }
            })
            return await ctx.commitTransaction().then(async () => {
                return await this.fetchResolver({ message: '操作成功' })
            })
        } catch (err) {
            await ctx.rollbackTransaction()
            return await this.fetchCatchCompiler('SystemRoleService:httpBaseSwitchSystemRole', err)
        } finally {
            await ctx.release()
        }
    }

    /**编辑角色权限**/
    public async httpBaseUpdateSystemRoleRouter(request: OmixRequest, body: field.BaseUpdateSystemRoleRouter) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
            await this.database.fetchConnectNotNull(this.database.schemaRole, {
                message: `keyId:${body.keyId} 不存在`,
                dispatch: { where: { keyId: body.keyId } }
            })
            await this.database.fetchConnectUpdate(this.database.schemaRole, {
                where: { keyId: body.keyId },
                body: { auxs: body.auxs ?? [], uid: request.user.uid }
            })
            return await ctx.commitTransaction().then(async () => {
                return await this.fetchResolver({ message: '操作成功' })
            })
        } catch (err) {
            await ctx.rollbackTransaction()
            return await this.fetchCatchCompiler('SystemRoleService:httpBaseUpdateSystemRoleRouter', err)
        } finally {
            await ctx.release()
        }
    }

    /**编辑角色用户**/
    public async httpBaseUpdateSystemRoleUser(request: OmixRequest, body: field.BaseUpdateSystemRoleUser) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
            await this.database.fetchConnectNotNull(this.database.schemaRole, {
                message: `keyId:${body.keyId} 不存在`,
                dispatch: { where: { keyId: body.keyId } }
            })
            await this.database.fetchConnectUpdate(this.database.schemaRole, {
                where: { keyId: body.keyId },
                body: { uids: body.uids ?? [], uid: request.user.uid }
            })
            return await ctx.commitTransaction().then(async () => {
                return await this.fetchResolver({ message: '操作成功' })
            })
        } catch (err) {
            await ctx.rollbackTransaction()
            return await this.fetchCatchCompiler('SystemRoleService:httpBaseUpdateSystemRoleUser', err)
        } finally {
            await ctx.release()
        }
    }

    /**角色权限列表**/
    public async httpBaseColumnSystemRole(request: OmixRequest, body: field.BaseColumnSystemRole) {
        try {
            return await this.database.fetchConnectBuilder(this.database.schemaRole, async qb => {
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
                return await qb.getManyAndCount().then(async ([list = [], total = 0]) => {
                    return await this.fetchResolver({ message: '操作成功', total, list })
                })
            })
        } catch (err) {
            return await this.fetchCatchCompiler('SystemRoleService:httpBaseColumnSystemRole', err)
        }
    }
}
