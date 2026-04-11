import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { DataBaseService, WindowsService, schema, enums } from '@/modules/database/database.service'
import { fetchTreeNodeBlock, fetchHandler, isEmpty, isNotEmpty } from '@/utils'
import { OmixRequest } from '@/interface'
import { Not, In } from 'typeorm'
import * as tree from 'tree-tool'
import * as windows from '@web-windows-server/interface'

@Injectable()
export class DeptService extends Logger {
    constructor(private readonly database: DataBaseService, private readonly windows: WindowsService) {
        super()
    }

    /**新增部门**/
    @AutoDescriptor
    public async httpBaseSystemCreateDepartment(request: OmixRequest, body: windows.CreateDeptOptions) {
        const ctx = await this.database.transaction()
        try {
            await this.database.empty(this.windows.deptOptions, {
                next: isNotEmpty(body.pid),
                request,
                message: 'pid:不存在',
                dispatch: { where: { keyId: body.pid } }
            })
            const node = await this.database.create(ctx.manager.getRepository(schema.WindowsDept), {
                request,
                stack: this.stack,
                body: Object.assign(body, { createBy: request.user.uid })
            })
            await this.database.create(ctx.manager.getRepository(schema.WindowsRole), {
                request,
                stack: this.stack,
                body: {
                    name: node.name,
                    comment: `${node.name}默认部门角色`,
                    sort: 10,
                    deptId: node.keyId,
                    chunk: enums.CHUNK_WINDOWS_ROLE_CHUNK.department.value,
                    model: enums.CHUNK_WINDOWS_ROLE_MODEL.dept_member.value,
                    createBy: request.user.uid
                }
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

    /**编辑部门**/
    @AutoDescriptor
    public async httpBaseSystemUpdateDepartment(request: OmixRequest, body: windows.UpdateDeptOptions) {
        const ctx = await this.database.transaction()
        try {
            await this.database.empty(this.windows.deptOptions, {
                request,
                message: 'keyId:不存在',
                dispatch: { where: { keyId: body.keyId } }
            })
            await this.database.empty(this.windows.deptOptions, {
                next: isNotEmpty(body.pid),
                request,
                message: 'pid:不存在',
                dispatch: { where: { keyId: body.pid } }
            })
            await this.database.update(ctx.manager.getRepository(schema.WindowsDept), {
                request,
                stack: this.stack,
                where: { keyId: body.keyId },
                body: Object.assign(body, {
                    modifyBy: request.user.uid
                })
            })
            await this.database.builder(this.windows.roleOptions, async qb => {
                const node = await qb.where({ deptId: body.keyId, chunk: enums.CHUNK_WINDOWS_ROLE_CHUNK.department.value }).getOne()
                if (isNotEmpty(node)) {
                    return await this.database.update(ctx.manager.getRepository(schema.WindowsRole), {
                        request,
                        stack: this.stack,
                        where: { keyId: node.keyId },
                        body: { name: body.name }
                    })
                }
                return await this.database.create(ctx.manager.getRepository(schema.WindowsRole), {
                    request,
                    stack: this.stack,
                    body: {
                        name: body.name,
                        comment: `${body.name}默认部门角色`,
                        sort: 10,
                        deptId: body.keyId,
                        chunk: enums.CHUNK_WINDOWS_ROLE_CHUNK.department.value,
                        model: enums.CHUNK_WINDOWS_ROLE_MODEL.dept_member.value,
                        createBy: request.user.uid
                    }
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

    /**菜单树结构**/
    @AutoDescriptor
    public async httpBaseSystemDepartmentTreeStructure(request: OmixRequest) {
        try {
            return await this.database.builder(this.windows.deptOptions, async qb => {
                return await qb.getMany().then(async nodes => {
                    const items = fetchTreeNodeBlock(tree.fromList(nodes, { id: 'keyId', pid: 'pid' }))
                    return await this.fetchResolver({ list: items })
                })
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        }
    }

    /**部门详情**/
    @AutoDescriptor
    public async httpBaseSystemDepartmentResolver(request: OmixRequest, body: windows.DeptPayloadOptions) {
        try {
            return await this.database.empty(this.windows.deptOptions, {
                request,
                message: 'keyId:不存在',
                dispatch: { where: { keyId: body.keyId } }
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        }
    }

    /**部门成员列表**/
    @AutoDescriptor
    public async httpBaseSystemDeptMemberOptions(request: OmixRequest, body: windows.DeptPayloadOptions) {
        try {
            return await this.database.builder(this.windows.deptAccountOptions, async qb => {
                qb.leftJoinAndMapOne('t.account', schema.WindowsAccount, 'account', 'account.uid = t.uid')
                qb.where(`t.deptId = :deptId`, { deptId: body.keyId })
                return await qb.getMany().then(async nodes => {
                    const list = nodes.map((node: any) => ({
                        uid: node.uid,
                        chunk: node.chunk,
                        name: node.account?.name ?? '',
                        number: node.account?.number ?? '',
                        avatar: node.account?.avatar ?? ''
                    }))
                    return await this.fetchResolver({ list })
                })
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        }
    }

    /**分页列表查询**/
    @AutoDescriptor
    public async httpBaseSystemColumnDepartment(request: OmixRequest, body: windows.ColumnDeptOptions) {
        try {
            return await this.database.builder(this.windows.deptOptions, async qb => {
                qb.leftJoinAndMapOne('t.createBy', schema.WindowsAccount, 'createBy', 'createBy.uid = t.createBy')
                qb.leftJoinAndMapOne('t.modifyBy', schema.WindowsAccount, 'modifyBy', 'modifyBy.uid = t.modifyBy')
                if (isNotEmpty(body.name)) {
                    qb.where(`t.name LIKE :name`, { name: `%${body.name}%` })
                }
                if (isNotEmpty(body.alias)) {
                    qb.where(`t.alias LIKE :alias`, { alias: `%${body.alias}%` })
                }
                if (isNotEmpty(body.pid)) {
                    qb.andWhere(`t.keyId = :pid OR t.pid = :pid`, { pid: body.pid })
                }
                qb.skip((body.page - 1) * body.size)
                qb.take(body.size)
                return await qb.getManyAndCount().then(async ([list, total]) => {
                    /**查询每个部门的管理员和子管理员**/
                    const deptIds = list.map((item: any) => item.keyId)
                    if (deptIds.length > 0) {
                        /**查询关联账号数量**/
                        const accountCounts = await this.database.builder(this.windows.deptAccountOptions, async cqb => {
                            cqb.select('t.deptId', 'deptId')
                            cqb.addSelect('COUNT(*)', 'count')
                            cqb.where(`t.deptId IN (:...deptIds)`, { deptIds })
                            cqb.groupBy('t.deptId')
                            return await cqb.getRawMany()
                        })
                        /**查询管理员/子管理员**/
                        const members = await this.database.builder(this.windows.deptAccountOptions, async mqb => {
                            mqb.leftJoinAndMapOne('t.account', schema.WindowsAccount, 'account', 'account.uid = t.uid')
                            mqb.where(`t.deptId IN (:...deptIds)`, { deptIds })
                            mqb.andWhere(`t.chunk IN (:...chunks)`, {
                                chunks: [enums.CHUNK_WINDOWS_DEPT_MEMBER.admin.value, enums.CHUNK_WINDOWS_DEPT_MEMBER.sub_admin.value]
                            })
                            return await mqb.getMany()
                        })
                        list.forEach((item: Omix<schema.WindowsDept>) => {
                            const deptMembers = members.filter((m: any) => m.deptId === item.keyId)
                            const deptAdmin: Omix<schema.WindowsDeptAccount> = deptMembers.find((m: Omix) => {
                                return m.chunk === enums.CHUNK_WINDOWS_DEPT_MEMBER.admin.value
                            })
                            const deptSubAdmins: Array<Omix<schema.WindowsDeptAccount>> = deptMembers.filter((m: Omix) => {
                                return m.chunk === enums.CHUNK_WINDOWS_DEPT_MEMBER.sub_admin.value
                            })
                            item.admin = deptAdmin?.account ?? null
                            item.subAdmins = deptSubAdmins.map(m => m.account)
                            item.accountCount = Number(accountCounts.find((c: any) => c.deptId === item.keyId)?.count ?? 0)
                        })
                    }
                    return await this.fetchResolver({ page: body.page, size: body.size, total, list })
                })
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        }
    }

    /**删除部门**/
    @AutoDescriptor
    public async httpBaseSystemDeleteDepartment(request: OmixRequest, body: windows.DeleteDeptOptions) {
        const ctx = await this.database.transaction()
        try {
            // 查询部门是否存在
            const dept = await this.database.empty(this.windows.deptOptions, {
                request,
                message: 'keyId:不存在',
                dispatch: { where: { keyId: body.keyId } }
            })
            // 递归获取所有子部门ID
            const getAllChildDeptIds = async (parentId: number): Promise<number[]> => {
                const childDepts = await this.database.builder(this.windows.deptOptions, async qb => {
                    qb.where(`t.pid = :pid`, { pid: parentId })
                    return await qb.getMany()
                })
                let allIds: number[] = []
                for (const child of childDepts) {
                    const childIds = await getAllChildDeptIds(child.keyId)
                    allIds = [...allIds, child.keyId, ...childIds]
                }
                return allIds
            }
            const allDeptIds = [body.keyId, ...(await getAllChildDeptIds(body.keyId))]
            // 批量删除部门关联的部门-账号关系
            await ctx.manager.getRepository(schema.WindowsDeptAccount).delete({ deptId: In(allDeptIds) })
            // 批量删除部门关联的角色（部门角色）
            await ctx.manager.getRepository(schema.WindowsRole).delete({ deptId: In(allDeptIds) })
            // 批量删除所有子部门
            await ctx.manager.getRepository(schema.WindowsDept).delete({ keyId: In(allDeptIds) })
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

    /**设置部门成员角色**/
    @AutoDescriptor
    public async httpBaseSystemUpdateDeptMember(request: OmixRequest, body: windows.UpdateDeptMemberOptions) {
        const ctx = await this.database.transaction()
        try {
            /**验证部门存在**/
            await this.database.empty(this.windows.deptOptions, {
                request,
                message: 'deptId:部门不存在',
                dispatch: { where: { keyId: body.deptId } }
            })
            /**验证关联记录存在**/
            const record = await this.database.empty(this.windows.deptAccountOptions, {
                request,
                message: '该账号不在此部门中',
                dispatch: { where: { deptId: body.deptId, uid: body.uid } }
            })
            /**如果设置为管理员，先将该部门已有管理员降为普通成员**/
            if (body.chunk === enums.CHUNK_WINDOWS_DEPT_MEMBER.admin.value) {
                const currentAdmin = await this.database.builder(this.windows.deptAccountOptions, async qb => {
                    qb.where(`t.deptId = :deptId`, { deptId: body.deptId })
                    qb.andWhere(`t.chunk = :chunk`, { chunk: enums.CHUNK_WINDOWS_DEPT_MEMBER.admin.value })
                    return await qb.getOne()
                })
                if (isNotEmpty(currentAdmin)) {
                    await this.database.update(ctx.manager.getRepository(schema.WindowsDeptAccount), {
                        request,
                        stack: this.stack,
                        where: { keyId: currentAdmin.keyId },
                        body: { chunk: enums.CHUNK_WINDOWS_DEPT_MEMBER.member.value }
                    })
                }
            }
            /**更新成员角色**/
            await this.database.update(ctx.manager.getRepository(schema.WindowsDeptAccount), {
                request,
                stack: this.stack,
                where: { keyId: record.keyId },
                body: { chunk: body.chunk }
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
}
