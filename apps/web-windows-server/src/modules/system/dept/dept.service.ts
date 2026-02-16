import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { DataBaseService, WindowsService, schema } from '@/modules/database/database.service'
import { fetchTreeNodeBlock } from '@/utils'
import { isNotEmpty } from 'class-validator'
import { OmixRequest } from '@/interface'
import { Not } from 'typeorm'
import * as tree from 'tree-tool'
import * as windows from '@web-windows-server/interface'

@Injectable()
export class DeptService extends Logger {
    constructor(private readonly database: DataBaseService, private readonly windows: WindowsService) {
        super()
    }

    /**添加部门**/
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
            await this.database.create(ctx.manager.getRepository(schema.WindowsDept), {
                request,
                stack: this.stack,
                body: Object.assign(body, {
                    createBy: request.user.uid
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
                if (isNotEmpty(body.pid)) {
                    qb.andWhere(`t.keyId = :pid OR t.pid = :pid`, { pid: body.pid })
                }
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
}
