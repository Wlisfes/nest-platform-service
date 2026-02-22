import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { DataBaseService, WindowsService, schema, enums } from '@/modules/database/database.service'
import { fetchTreeNodeBlock, fetchTreeFromList } from '@/utils'
import { isNotEmpty } from 'class-validator'
import { OmixRequest } from '@/interface'
import { In } from 'typeorm'
import * as windows from '@web-windows-server/interface'

@Injectable()
export class RoleService extends Logger {
    constructor(private readonly database: DataBaseService, private readonly windows: WindowsService) {
        super()
    }

    /**新增岗位角色**/
    @AutoDescriptor
    public async httpBaseSystemCreateRole(request: OmixRequest, body: windows.CreateRoleOptions) {
        const ctx = await this.database.transaction()
        try {
            await this.database.create(ctx.manager.getRepository(schema.WindowsRole), {
                request,
                stack: this.stack,
                body: Object.assign(body, {
                    createBy: request.user.uid,
                    chunk: enums.CHUNK_WINDOWS_ROLE_CHUNK.common.value
                })
            })
            return await ctx.commitTransaction().then(async () => {
                return await this.fetchResolver({ message: '操作成功' })
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        } finally {
            await ctx.release()
        }
    }

    /**编辑岗位角色**/
    @AutoDescriptor
    public async httpBaseSystemUpdateRole(request: OmixRequest, body: windows.UpdateRoleOptions) {
        const ctx = await this.database.transaction()
        try {
            await this.database.empty(this.windows.roleOptions, {
                request,
                message: 'keyId:不存在',
                stack: this.stack,
                dispatch: { where: { keyId: body.keyId } }
            })
            await this.database.update(ctx.manager.getRepository(schema.WindowsRole), {
                request,
                stack: this.stack,
                where: { keyId: body.keyId },
                body: Object.assign(body, {
                    modifyBy: request.user.uid,
                    chunk: enums.CHUNK_WINDOWS_ROLE_CHUNK.common.value
                })
            })
            return await ctx.commitTransaction().then(async () => {
                return await this.fetchResolver({ message: '操作成功' })
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        } finally {
            await ctx.release()
        }
    }

    /**角色列表查询**/
    @AutoDescriptor
    public async httpBaseSystemColumnRole(request: OmixRequest) {
        try {
            const list = await this.database.builder(this.windows.roleOptions, async qb => {
                qb.where(`t.chunk = :chunk`, { chunk: enums.CHUNK_WINDOWS_ROLE_CHUNK.common.value })
                qb.orderBy('t.sort', 'ASC')
                return await qb.getMany()
            })
            const dept = await this.database.builder(this.windows.deptOptions, async qb => {
                qb.leftJoinAndMapOne('t.node', schema.WindowsRole, 'node', 'node.deptId = t.keyId')
                qb.where(`node.chunk = :chunk`, { chunk: enums.CHUNK_WINDOWS_ROLE_CHUNK.department.value })
                return await qb.getMany().then(async nodes => {
                    return fetchTreeNodeBlock(fetchTreeFromList(nodes, { id: 'keyId', pid: 'pid' }))
                })
            })
            return await this.fetchResolver({ list, dept })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        }
    }

    /**角色详情**/
    @AutoDescriptor
    public async httpBaseSystemRoleResolver(request: OmixRequest, body: windows.RolePayloadOptions) {
        try {
            return await this.database.empty(this.windows.roleOptions, {
                request,
                message: 'keyId:不存在',
                stack: this.stack,
                dispatch: { where: { keyId: body.keyId } }
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        }
    }

    /**角色关联账号列表**/
    @AutoDescriptor
    public async httpBaseSystemColumnAccountRole(request: OmixRequest, body: windows.ColumnAccountRoleOptions) {
        try {
            await this.database.empty(this.windows.roleOptions, {
                request,
                message: 'roleId:不存在',
                stack: this.stack,
                dispatch: { where: { keyId: body.roleId } }
            })
            return await this.database.builder(this.windows.roleAccountOptions, async qb => {
                qb.leftJoinAndMapOne('t.uid', schema.WindowsAccount, 'account', 'account.uid = t.uid')
                qb.where(`t.role_id = :roleId`, { roleId: body.roleId })
                qb.skip((body.page - 1) * body.size)
                qb.take(body.size)
                return await qb.getManyAndCount().then(async ([list, total]) => {
                    return await this.fetchResolver({ page: body.page, size: body.size, total, list })
                })
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        }
    }

    /**角色关联用户**/
    @AutoDescriptor
    public async httpBaseSystemCreateAccountRole(request: OmixRequest, body: windows.CreateAccountRoleOptions) {
        const ctx = await this.database.transaction()
        try {
            await this.database.empty(this.windows.roleOptions, {
                request,
                message: 'roleId:不存在',
                stack: this.stack,
                dispatch: { where: { keyId: body.roleId } }
            })
            for (const uid of body.uids) {
                const exist = await this.database.builder(this.windows.roleAccountOptions, async qb => {
                    qb.where(`t.role_id = :roleId AND t.uid = :uid`, { roleId: body.roleId, uid })
                    return await qb.getOne()
                })
                if (!exist) {
                    await this.database.create(ctx.manager.getRepository(schema.WindowsRoleAccount), {
                        request,
                        stack: this.stack,
                        body: { roleId: body.roleId, uid, createBy: request.user.uid }
                    })
                }
            }
            return await ctx.commitTransaction().then(async () => {
                return await this.fetchResolver({ message: '操作成功' })
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        } finally {
            await ctx.release()
        }
    }

    /**删除角色关联用户**/
    @AutoDescriptor
    public async httpBaseSystemDeleteAccountRole(request: OmixRequest, body: windows.DeleteAccountRoleOptions) {
        const ctx = await this.database.transaction()
        try {
            await this.database.empty(this.windows.roleOptions, {
                request,
                message: 'roleId:不存在',
                dispatch: { where: { keyId: body.roleId } }
            })
            await this.database.delete(ctx.manager.getRepository(schema.WindowsRoleAccount), {
                request,
                stack: this.stack,
                where: { roleId: body.roleId, keyId: In(body.keys) }
            })
            return await ctx.commitTransaction().then(async () => {
                return await this.fetchResolver({ message: '操作成功' })
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        } finally {
            await ctx.release()
        }
    }

    /**角色菜单权限列表**/
    @AutoDescriptor
    public async httpBaseSystemColumnRoleSheet(request: OmixRequest, body: windows.ColumnRoleSheetOptions) {
        try {
            await this.database.empty(this.windows.roleOptions, {
                request,
                message: 'roleId:不存在',
                dispatch: { where: { keyId: body.roleId } }
            })
            return await this.database.builder(this.windows.roleSheetOptions, async qb => {
                qb.where(`t.role_id = :roleId`, { roleId: body.roleId })
                return await qb.getMany().then(async list => {
                    return await this.fetchResolver({ list })
                })
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        }
    }
}
