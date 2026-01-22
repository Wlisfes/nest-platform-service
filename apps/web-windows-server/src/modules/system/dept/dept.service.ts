import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { In } from 'typeorm'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { DataBaseService, WindowsService, schema } from '@/modules/database/database.service'
import { OmixRequest } from '@/interface'
import { isNotEmpty } from 'class-validator'
import { fetchHandler, fetchTreeNodeBlock } from '@/utils'
import * as tree from 'tree-tool'
import * as windows from '@web-windows-server/interface'

@Injectable()
export class DeptService extends Logger {
    constructor(private readonly database: DataBaseService, private readonly windows: WindowsService) {
        super()
    }

    private async assertDeptPidExists(request: OmixRequest, pid?: string) {
        if (!isNotEmpty(pid)) {
            return
        }
        const parentId = Number(pid)
        if (Number.isNaN(parentId)) {
            throw new HttpException('pid 不存在', HttpStatus.BAD_REQUEST)
        }
        await this.database.empty(this.windows.dept, {
            request,
            message: 'pid 不存在',
            dispatch: { where: { keyId: parentId } }
        })
    }

    private async assertDeptNoCycle(request: OmixRequest, keyId: number, pid?: string) {
        if (!isNotEmpty(pid)) {
            return
        }
        const parentId = Number(pid)
        if (Number.isNaN(parentId)) {
            return
        }
        let cursor = parentId
        while (cursor) {
            if (cursor === keyId) {
                throw new HttpException('不能将部门设置为自己的子部门', HttpStatus.BAD_REQUEST)
            }
            const next = await this.windows.dept.findOne({ where: { keyId: cursor } })
            if (!isNotEmpty(next) || !isNotEmpty(next.pid)) {
                break
            }
            const nextId = Number(next.pid)
            if (Number.isNaN(nextId)) {
                break
            }
            cursor = nextId
        }
    }

    private async assertDeptNameUnique(request: OmixRequest, name: string, pid?: string, excludeKeyId?: number) {
        await this.database.builder(this.windows.dept, async qb => {
            qb.where(`t.name = :name`, { name })
            if (isNotEmpty(pid)) {
                qb.andWhere(`t.pid = :pid`, { pid })
            } else {
                qb.andWhere(`t.pid is null`)
            }
            await qb.getOne().then(async node => {
                if (isNotEmpty(node) && (excludeKeyId ? node.keyId !== excludeKeyId : true)) {
                    throw new HttpException(`name:${name} 已存在`, HttpStatus.BAD_REQUEST)
                }
                return node
            })
        })
    }

    /**新增部门**/
    @AutoDescriptor
    public async httpBaseSystemCreateDept(request: OmixRequest, body: windows.CreateDeptOptions) {
        const ctx = await this.database.transaction()
        try {
            await this.assertDeptNameUnique(request, body.name, body.pid)
            await this.assertDeptPidExists(request, body.pid)
            await this.database.create(ctx.manager.getRepository(schema.WindowsDept), {
                request,
                stack: this.stack,
                body: Object.assign(body, { createBy: request.user.uid })
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
    public async httpBaseSystemUpdateDept(request: OmixRequest, body: windows.UpdateDeptOptions) {
        const ctx = await this.database.transaction()
        try {
            await this.database.empty(this.windows.dept, {
                request,
                message: 'keyId不存在',
                dispatch: { where: { keyId: body.keyId } }
            })
            await this.assertDeptPidExists(request, body.pid)
            await this.assertDeptNoCycle(request, body.keyId, body.pid)
            await this.assertDeptNameUnique(request, body.name, body.pid, body.keyId)

            await this.database.update(ctx.manager.getRepository(schema.WindowsDept), {
                request,
                stack: this.stack,
                where: { keyId: body.keyId },
                body: Object.assign(body, { modifyBy: request.user.uid })
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

    /**部门详情**/
    @AutoDescriptor
    public async httpBaseSystemResolverDept(request: OmixRequest, body: windows.DeptResolverOptions) {
        try {
            return await this.database.empty(this.windows.dept, {
                request,
                message: 'keyId不存在',
                dispatch: { where: { keyId: body.keyId } }
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        }
    }

    /**部门树结构表**/
    @AutoDescriptor
    public async httpBaseSystemSelectDept(request: OmixRequest) {
        try {
            return await this.database.builder(this.windows.dept, async qb => {
                return await qb.getMany().then(async nodes => {
                    const items = fetchTreeNodeBlock(
                        tree.fromList(
                            nodes.map((n: any) => ({ ...n, pidNum: isNotEmpty(n.pid) ? Number(n.pid) : null })),
                            { id: 'keyId', pid: 'pidNum' }
                        )
                    )
                    items.forEach((n: any) => delete n.pidNum)
                    return await this.fetchResolver({ list: items })
                })
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        }
    }

    /**部门列表**/
    @AutoDescriptor
    public async httpBaseSystemColumnDept(request: OmixRequest, body: windows.ColumnDeptOptions) {
        try {
            return await this.database.builder(this.windows.dept, async qb => {
                await fetchHandler(isNotEmpty(body.vague), async () => {
                    qb.andWhere(`(t.name like :vague OR t.alias like :vague)`, { vague: `%${body.vague}%` })
                })
                await fetchHandler(isNotEmpty(body.name), async () => {
                    qb.andWhere(`t.name like :name`, { name: `%${body.name}%` })
                })
                await fetchHandler(isNotEmpty(body.alias), async () => {
                    qb.andWhere(`t.alias like :alias`, { alias: `%${body.alias}%` })
                })
                await fetchHandler(isNotEmpty(body.pid), async () => {
                    qb.andWhere(`t.pid = :pid`, { pid: body.pid })
                })
                return await qb.getMany().then(async nodes => {
                    const items = fetchTreeNodeBlock(
                        tree.fromList(
                            nodes.map((n: any) => ({ ...n, pidNum: isNotEmpty(n.pid) ? Number(n.pid) : null })),
                            { id: 'keyId', pid: 'pidNum' }
                        )
                    )
                    items.forEach((n: any) => delete n.pidNum)
                    return await this.fetchResolver({ list: items })
                })
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        }
    }

    /**删除部门**/
    @AutoDescriptor
    public async httpBaseSystemDeleteDept(request: OmixRequest, body: windows.DeleteDeptOptions) {
        const ctx = await this.database.transaction()
        try {
            const keys = body.keys ?? []
            if (keys.length === 0) {
                throw new HttpException('keys 必填', HttpStatus.BAD_REQUEST)
            }

            const repo = ctx.manager.getRepository(schema.WindowsDept)
            const nodes = await repo.find({ where: { keyId: In(keys) } })
            if (nodes.length !== keys.length) {
                const exists = new Set(nodes.map(n => n.keyId))
                const miss = keys.filter(id => !exists.has(id))
                throw new HttpException(`keyId不存在:${miss.join(',')}`, HttpStatus.BAD_REQUEST)
            }

            const children = await repo.find({ where: { pid: In(keys.map(id => String(id))) } })
            if (children.length > 0) {
                throw new HttpException('存在子部门，不可删除', HttpStatus.BAD_REQUEST)
            }

            await ctx.manager.getRepository(schema.WindowsDeptAccount).delete({ deptId: In(keys) })
            await repo.delete({ keyId: In(keys) })

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
