import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { DeployAccountUtilsService } from '@web-windows-server/modules/deploy/account/account.utils.service'
import { DataBaseService, WindowsService, schema, enums } from '@/modules/database/database.service'
import { fetchTreeNodeBlock, fetchTreeFromList } from '@/utils'
import { isNotEmpty } from 'class-validator'
import { OmixRequest } from '@/interface'
import { In } from 'typeorm'
import * as windows from '@web-windows-server/interface'
import * as tree from 'tree-tool'

@Injectable()
export class DeployRoleService extends Logger {
    constructor(
        private readonly database: DataBaseService,
        private readonly windows: WindowsService,
        private readonly accountUtilsService: DeployAccountUtilsService
    ) {
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
                    chunk: enums.CHUNK_ROLE_CHUNK.common.value
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
                    chunk: enums.CHUNK_ROLE_CHUNK.common.value
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
                qb.where(`t.chunk = :chunk`, { chunk: enums.CHUNK_ROLE_CHUNK.common.value })
                qb.orderBy('t.sort', 'ASC')
                return await qb.getMany()
            })
            const dept = await this.database.builder(this.windows.deptOptions, async qb => {
                qb.leftJoinAndMapOne('t.node', schema.WindowsRole, 'node', 'node.deptId = t.keyId')
                qb.where(`node.chunk = :chunk`, { chunk: enums.CHUNK_ROLE_CHUNK.department.value })
                return await qb.getMany().then(async nodes => {
                    return fetchTreeNodeBlock(
                        fetchTreeFromList(
                            nodes.map((e: Omix) => ({ ...e, nodeId: e.node?.keyId })),
                            { id: 'keyId', pid: 'pid' }
                        )
                    )
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
            const node = await this.database.empty(this.windows.roleOptions, {
                request,
                message: 'roleId:不存在',
                stack: this.stack,
                dispatch: { where: { keyId: body.roleId } }
            })
            if (node.chunk === enums.CHUNK_ROLE_CHUNK.common.value) {
                return await this.database.builder(this.windows.accountOptions, async qb => {
                    qb.innerJoin(schema.WindowsRoleAccount, 'rel', 'rel.uid = t.uid')
                    qb.where(`rel.role_id = :roleId`, { roleId: body.roleId })
                    if (isNotEmpty(body.vague)) {
                        qb.andWhere(`(t.number LIKE :vague OR t.name LIKE :vague)`, { vague: `%${body.vague}%` })
                    }
                    if (isNotEmpty(body.phone)) {
                        qb.andWhere(`t.phone LIKE :phone`, { phone: `%${body.phone}%` })
                    }
                    if (isNotEmpty(body.email)) {
                        qb.andWhere(`t.email LIKE :email`, { email: `%${body.email}%` })
                    }
                    qb.skip((body.page - 1) * body.size)
                    qb.take(body.size)
                    return await qb.getManyAndCount().then(async ([list, total]) => {
                        return await this.fetchResolver({
                            page: body.page,
                            size: body.size,
                            total,
                            list: await this.accountUtilsService.fetchUtilsMergeColumnAccount(request, list)
                        })
                    })
                })
            }
            if (node.chunk === enums.CHUNK_ROLE_CHUNK.department.value) {
                if (!isNotEmpty(node.deptId)) {
                    throw new HttpException('deptId:不存在', HttpStatus.BAD_REQUEST)
                }
                const deptIds = await this.database.builder(this.windows.deptOptions, async qb => {
                    const nodes = await qb.getMany()
                    const items = tree.fromList(nodes, { id: 'keyId', pid: 'pid' })
                    const root = tree.findNode(items, (dept: Omix) => dept.keyId === node.deptId, { id: 'keyId', children: 'children' })
                    if (!root) {
                        throw new HttpException('deptId:不存在', HttpStatus.BAD_REQUEST)
                    }
                    const result = new Set<number>()
                    const queue: any[] = [root]
                    while (queue.length) {
                        const current = queue.shift()
                        if (current && isNotEmpty(current.keyId)) {
                            result.add(current.keyId)
                        }
                        const children = current?.children
                        if (Array.isArray(children) && children.length) {
                            queue.push(...children)
                        }
                    }
                    return Array.from(result)
                })

                return await this.database.builder(this.windows.accountOptions, async qb => {
                    qb.innerJoin(schema.WindowsDeptAccount, 'rel', 'rel.uid = t.uid')
                    qb.where(`rel.dept_id IN (:...deptIds)`, { deptIds })
                    if (isNotEmpty(body.vague)) {
                        qb.andWhere(`(t.number LIKE :vague OR t.name LIKE :vague)`, { vague: `%${body.vague}%` })
                    }
                    if (isNotEmpty(body.phone)) {
                        qb.andWhere(`t.phone LIKE :phone`, { phone: `%${body.phone}%` })
                    }
                    if (isNotEmpty(body.email)) {
                        qb.andWhere(`t.email LIKE :email`, { email: `%${body.email}%` })
                    }
                    qb.skip((body.page - 1) * body.size)
                    qb.take(body.size)
                    return await qb.getManyAndCount().then(async ([list, total]) => {
                        return await this.fetchResolver({
                            page: body.page,
                            size: body.size,
                            total,
                            list: await this.accountUtilsService.fetchUtilsMergeColumnAccount(request, list)
                        })
                    })
                })
            }
            throw new HttpException('node.chunk:格式错误', HttpStatus.BAD_REQUEST)
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
                message: 'keyId:不存在',
                stack: this.stack,
                dispatch: { where: { keyId: body.keyId } }
            })
            // 查询已存在的关联记录
            const existRecords = await this.database.builder(this.windows.roleAccountOptions, async qb => {
                qb.where(`t.role_id = :roleId AND t.uid IN (:...uids)`, { roleId: body.keyId, uids: body.uids })
                return await qb.getMany()
            })
            const existUids = new Set(existRecords.map((item: Omix) => item.uid))
            const newUids = body.uids.filter(uid => !existUids.has(uid))
            // 批量插入新的关联记录
            if (newUids.length > 0) {
                await ctx.manager
                    .getRepository(schema.WindowsRoleAccount)
                    .insert(newUids.map(uid => ({ roleId: body.keyId, uid, createBy: request.user.uid })))
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
                message: 'keyId:不存在',
                dispatch: { where: { keyId: body.keyId } }
            })
            await this.database.delete(ctx.manager.getRepository(schema.WindowsRoleAccount), {
                request,
                stack: this.stack,
                where: { roleId: body.keyId, uid: In(body.uids) }
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
                qb.select('t.sheet_id', 'sheetId')
                qb.where(`t.role_id = :roleId`, { roleId: body.roleId })
                return await qb.getRawMany().then(async list => {
                    return await this.fetchResolver({ list: list.map(item => item.sheetId) })
                })
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        }
    }

    /**更新角色菜单权限**/
    @AutoDescriptor
    public async httpBaseSystemUpdateRoleSheet(request: OmixRequest, body: windows.UpdateRoleSheetOptions) {
        const ctx = await this.database.transaction()
        try {
            await this.database.empty(this.windows.roleOptions, {
                request,
                message: 'roleId:不存在',
                stack: this.stack,
                dispatch: { where: { keyId: body.roleId } }
            })
            // 删除旧的关联记录
            await ctx.manager.getRepository(schema.WindowsRoleSheet).delete({ roleId: body.roleId })
            // 批量插入新的关联记录
            if (body.sheetIds && body.sheetIds.length > 0) {
                await ctx.manager
                    .getRepository(schema.WindowsRoleSheet)
                    .insert(body.sheetIds.map(sheetId => ({ roleId: body.roleId, sheetId, createBy: request.user.uid })))
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

    /**更新角色数据权限**/
    @AutoDescriptor
    public async httpBaseSystemUpdateRoleModel(request: OmixRequest, body: windows.UpdateRoleModelOptions) {
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
                body: { model: body.model, modifyBy: request.user.uid }
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

    /**删除岗位角色**/
    @AutoDescriptor
    public async httpBaseSystemDeleteRole(request: OmixRequest, body: windows.DeleteRoleOptions) {
        const ctx = await this.database.transaction()
        try {
            await this.database.empty(this.windows.roleOptions, {
                request,
                message: 'keyId:不存在',
                stack: this.stack,
                dispatch: { where: { keyId: body.keyId } }
            })
            // 删除角色关联的菜单权限记录
            await ctx.manager.getRepository(schema.WindowsRoleSheet).delete({ roleId: body.keyId })
            // 删除角色关联的用户记录
            await ctx.manager.getRepository(schema.WindowsRoleAccount).delete({ roleId: body.keyId })
            // 删除角色本身
            await this.database.delete(ctx.manager.getRepository(schema.WindowsRole), {
                request,
                stack: this.stack,
                where: { keyId: body.keyId }
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

    /**批量更新角色排序**/
    @AutoDescriptor
    public async httpBaseSystemUpdateRoleSort(request: OmixRequest, body: windows.UpdateRoleSortOptions) {
        try {
            if (body.list && body.list.length > 0) {
                const keyIds = body.list.map(item => item.keyId)
                const cases = body.list.map(item => `WHEN key_id = ${item.keyId} THEN ${item.sort}`).join(' ')
                await this.windows.roleOptions
                    .createQueryBuilder()
                    .update()
                    .set({ sort: () => `CASE ${cases} END` })
                    .whereInIds(keyIds)
                    .execute()
            }
            return await this.fetchResolver({ message: '操作成功' })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        }
    }
}
