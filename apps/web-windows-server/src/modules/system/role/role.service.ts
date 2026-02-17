import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { DataBaseService, WindowsService, schema, enums } from '@/modules/database/database.service'
import { fetchTreeNodeBlock, fetchTreeFromList } from '@/utils'
import { isNotEmpty } from 'class-validator'
import { OmixRequest } from '@/interface'
import * as windows from '@web-windows-server/interface'

@Injectable()
export class RoleService extends Logger {
    constructor(private readonly database: DataBaseService, private readonly windows: WindowsService) {
        super()
    }

    /**添加通用角色**/
    @AutoDescriptor
    public async httpBaseSystemCreateCommonRole(request: OmixRequest, body: windows.CreateCommonRoleOptions) {
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

    /**添加部门角色**/
    @AutoDescriptor
    public async httpBaseSystemCreateDepartmentRole(request: OmixRequest, body: windows.CreateDepartmentRoleOptions) {
        const ctx = await this.database.transaction()
        try {
            await this.database.empty(this.windows.deptOptions, {
                request,
                message: 'deptId:不存在',
                dispatch: { where: { keyId: body.deptId } }
            })
            await this.database.create(ctx.manager.getRepository(schema.WindowsRole), {
                request,
                stack: this.stack,
                body: Object.assign(body, {
                    createBy: request.user.uid,
                    chunk: enums.CHUNK_WINDOWS_ROLE_CHUNK.department.value
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

    /**编辑通用角色**/
    @AutoDescriptor
    public async httpBaseSystemUpdateCommonRole(request: OmixRequest, body: windows.UpdateCommonRoleOptions) {
        const ctx = await this.database.transaction()
        try {
            await this.database.empty(this.windows.roleOptions, {
                request,
                message: 'keyId:不存在',
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

    /**编辑部门角色**/
    @AutoDescriptor
    public async httpBaseSystemUpdateDepartmentRole(request: OmixRequest, body: windows.UpdateDepartmentRoleOptions) {
        const ctx = await this.database.transaction()
        try {
            await this.database.empty(this.windows.roleOptions, {
                request,
                message: 'keyId:不存在',
                dispatch: { where: { keyId: body.keyId } }
            })
            await this.database.empty(this.windows.deptOptions, {
                request,
                message: 'deptId:不存在',
                dispatch: { where: { keyId: body.deptId } }
            })
            await this.database.update(ctx.manager.getRepository(schema.WindowsRole), {
                request,
                stack: this.stack,
                where: { keyId: body.keyId },
                body: Object.assign(body, {
                    modifyBy: request.user.uid,
                    chunk: enums.CHUNK_WINDOWS_ROLE_CHUNK.department.value
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

    /**角色详情**/
    @AutoDescriptor
    public async httpBaseSystemRoleResolver(request: OmixRequest, body: windows.RolePayloadOptions) {
        try {
            return await this.database.empty(this.windows.roleOptions, {
                request,
                message: 'keyId:不存在',
                dispatch: { where: { keyId: body.keyId } }
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        }
    }

    /**通用角色列表查询**/
    @AutoDescriptor
    public async httpBaseSystemColumnCommonRole(request: OmixRequest, body: windows.ColumnCommonRoleOptions) {
        try {
            return await this.database.builder(this.windows.roleOptions, async qb => {
                qb.where(`t.chunk = :chunk`, { chunk: enums.CHUNK_WINDOWS_ROLE_CHUNK.common.value })
                if (isNotEmpty(body.name)) {
                    qb.andWhere(`t.name LIKE :name`, { name: `%${body.name}%` })
                }
                qb.orderBy('t.sort', 'ASC')
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

    /**部门角色列表查询**/
    @AutoDescriptor
    public async httpBaseSystemColumnDepartmentRole(request: OmixRequest, body: windows.ColumnDepartmentRoleOptions) {
        try {
            return await this.database.builder(this.windows.deptOptions, async qb => {
                return await qb.getMany().then(async nodes => {
                    const items = fetchTreeNodeBlock(fetchTreeFromList(nodes, { id: 'keyId', pid: 'pid' }))
                    return await this.fetchResolver({ list: items })
                })
            })
            // return await this.database.builder(this.windows.roleOptions, async qb => {
            //     qb.leftJoinAndMapOne('t.deptId', schema.WindowsDept, 'dept', 'dept.keyId = t.dept_id')
            //     qb.where(`t.chunk = :chunk`, { chunk: enums.CHUNK_WINDOWS_ROLE_CHUNK.department.value })
            //     if (isNotEmpty(body.name)) {
            //         qb.andWhere(`t.name LIKE :name`, { name: `%${body.name}%` })
            //     }
            //     if (isNotEmpty(body.deptId)) {
            //         qb.andWhere(`t.dept_id = :deptId`, { deptId: body.deptId })
            //     }
            //     qb.orderBy('t.sort', 'ASC')
            //     qb.skip((body.page - 1) * body.size)
            //     qb.take(body.size)
            //     return await qb.getManyAndCount().then(async ([list, total]) => {
            //         return await this.fetchResolver({ page: body.page, size: body.size, total, list })
            //     })
            // })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        }
    }

    /**角色关联账号列表**/
    @AutoDescriptor
    public async httpBaseSystemColumnRoleAccount(request: OmixRequest, body: windows.ColumnRoleAccountOptions) {
        try {
            await this.database.empty(this.windows.roleOptions, {
                request,
                message: 'roleId:不存在',
                dispatch: { where: { keyId: body.roleId } }
            })
            return await this.database.builder(this.windows.roleAccountOptions, async qb => {
                qb.leftJoinAndMapOne('t.uid', schema.WindowsAccount, 'account', 'account.uid = t.uid')
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
