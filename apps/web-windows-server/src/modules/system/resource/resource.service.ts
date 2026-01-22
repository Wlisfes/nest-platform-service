import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { In } from 'typeorm'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { DataBaseService, WindowsService, schema, enums } from '@/modules/database/database.service'
import { OmixRequest } from '@/interface'
import { isEmpty, isNotEmpty } from 'class-validator'
import { faker, fetchHandler, fetchTreeNodeBlock } from '@/utils'
import * as tree from 'tree-tool'
import * as windows from '@web-windows-server/interface'

@Injectable()
export class ResourceService extends Logger {
    constructor(private readonly database: DataBaseService, private readonly windows: WindowsService) {
        super()
    }

    /**新增菜单资源**/
    @AutoDescriptor
    public async httpBaseSystemCreateResource(request: OmixRequest, body: windows.CreateResourceOptions) {
        const ctx = await this.database.transaction()
        try {
            await this.database.builder(this.windows.resource, async qb => {
                qb.where(`t.key = :key OR t.router = :router`, { key: body.key, router: body.router })
                await qb.getOne().then(async node => {
                    if (isNotEmpty(node) && node.key == body.key) {
                        throw new HttpException(`key:${body.key} 已存在`, HttpStatus.BAD_REQUEST)
                    } else if (isNotEmpty(node) && node.router === body.router) {
                        throw new HttpException(`router:${body.router} 已存在`, HttpStatus.BAD_REQUEST)
                    }
                    return node
                })
            })
            await this.database.empty(this.windows.resource, {
                request,
                message: 'pid不存在',
                next: isNotEmpty(body.pid),
                dispatch: { where: { keyId: body.pid } }
            })
            await this.database.create(ctx.manager.getRepository(schema.WindowsResource), {
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

    /**编辑菜单资源**/
    @AutoDescriptor
    public async httpBaseSystemUpdateResource(request: OmixRequest, body: windows.UpdateResourceOptions) {
        const ctx = await this.database.transaction()
        try {
            await this.database.empty(this.windows.resource, {
                request,
                message: 'keyId不存在',
                dispatch: { where: { keyId: body.keyId } }
            })
            await this.database.empty(this.windows.resource, {
                next: isNotEmpty(body.pid),
                request,
                message: 'pid不存在',
                dispatch: { where: { keyId: body.pid } }
            })
            await this.database.builder(this.windows.resource, async qb => {
                qb.where(`t.key = :key OR t.router = :router`, { key: body.key, router: body.router })
                await qb.getOne().then(async node => {
                    if (isNotEmpty(node) && node.keyId !== body.keyId && node.key == body.key) {
                        throw new HttpException(`key:${body.key} 已存在`, HttpStatus.BAD_REQUEST)
                    } else if (isNotEmpty(node) && node.keyId !== body.keyId && node.router === body.router) {
                        throw new HttpException(`router:${body.router} 已存在`, HttpStatus.BAD_REQUEST)
                    }
                    return node
                })
            })
            await this.database.update(ctx.manager.getRepository(schema.WindowsResource), {
                request,
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

    /**菜单资源详情**/
    @AutoDescriptor
    public async httpBaseSystemResourceResolver(request: OmixRequest, body: windows.ResourceResolverOptions) {
        try {
            return await this.database.empty(this.windows.resource, {
                request,
                message: 'keyId不存在',
                dispatch: { where: { keyId: body.keyId } }
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        }
    }

    /**菜单资源树结构表**/
    @AutoDescriptor
    public async httpBaseSystemSelectResource(request: OmixRequest) {
        try {
            return await this.database.builder(this.windows.resource, async qb => {
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

    /**菜单资源列表**/
    @AutoDescriptor
    public async httpBaseSystemColumnResource(request: OmixRequest, body: windows.ColumnResourceOptions) {
        try {
            return await this.database.builder(this.windows.resource, async qb => {
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

    /**菜单资源状态变更**/
    @AutoDescriptor
    public async httpBaseSystemSwitchResource(request: OmixRequest, body: windows.SwitchResourceOptions) {
        const ctx = await this.database.transaction()
        try {
            const keys = body.keys ?? []
            if (keys.length === 0) {
                throw new HttpException('keys 必填', HttpStatus.BAD_REQUEST)
            }
            const nodes = await ctx.manager.getRepository(schema.WindowsResource).find({ where: { keyId: In(keys) } })
            if (nodes.length !== keys.length) {
                const exists = new Set(nodes.map(n => n.keyId))
                const miss = keys.filter(id => !exists.has(id))
                throw new HttpException(`keyId不存在:${miss.join(',')}`, HttpStatus.BAD_REQUEST)
            }
            await ctx.manager
                .getRepository(schema.WindowsResource)
                .update({ keyId: In(keys) }, { status: body.status, modifyBy: request.user.uid })
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

    /**删除菜单资源**/
    @AutoDescriptor
    public async httpBaseSystemDeleteResource(request: OmixRequest, body: windows.DeleteResourceOptions) {
        const ctx = await this.database.transaction()
        try {
            const keys = body.keys ?? []
            if (keys.length === 0) {
                throw new HttpException('keys 必填', HttpStatus.BAD_REQUEST)
            }
            const resourceRepo = ctx.manager.getRepository(schema.WindowsResource)
            const sheetRepo = ctx.manager.getRepository(schema.WindowsResourceSheet)
            const apifoxRepo = ctx.manager.getRepository(schema.WindowsResourceApifox)
            const roleResourceRepo = ctx.manager.getRepository(schema.WindowsRoleResource)
            const roleSheetRepo = ctx.manager.getRepository(schema.WindowsRoleSheet)
            const roleApifoxRepo = ctx.manager.getRepository(schema.WindowsRoleApifox)

            const nodes = await resourceRepo.find({ where: { keyId: In(keys) } })
            if (nodes.length !== keys.length) {
                const exists = new Set(nodes.map(n => n.keyId))
                const miss = keys.filter(id => !exists.has(id))
                throw new HttpException(`keyId不存在:${miss.join(',')}`, HttpStatus.BAD_REQUEST)
            }
            const children = await resourceRepo.find({ where: { pid: In(keys) } })
            if (children.length > 0) {
                throw new HttpException('存在子菜单，不可删除', HttpStatus.BAD_REQUEST)
            }

            const sheets = await sheetRepo.find({ where: { pid: In(keys) } })
            const sheetIds = sheets.map(s => s.keyId)
            const apifoxes = await apifoxRepo.find({ where: { pid: In(keys) } })
            const apifoxIds = apifoxes.map(a => a.keyId)

            if (sheetIds.length > 0) {
                await roleSheetRepo.delete({ sheetId: In(sheetIds) })
                await sheetRepo.delete({ keyId: In(sheetIds) })
            }
            if (apifoxIds.length > 0) {
                await roleApifoxRepo.delete({ apifoxId: In(apifoxIds) })
                await apifoxRepo.delete({ keyId: In(apifoxIds) })
            }
            await roleResourceRepo.delete({ sid: In(keys) })
            await resourceRepo.delete({ keyId: In(keys) })

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

    /**新增操作按钮**/
    @AutoDescriptor
    public async httpBaseSystemCreateSheet(request: OmixRequest, body: windows.CreateSheetOptions) {
        const ctx = await this.database.transaction()
        try {
            await this.database.empty(this.windows.resource, {
                request,
                message: 'pid不存在',
                dispatch: { where: { keyId: body.pid } }
            })
            await this.database.builder(this.windows.resourceSheet, async qb => {
                qb.where(`t.pid = :pid AND t.key = :key`, { pid: body.pid, key: body.key })
                return await qb.getOne().then(async node => {
                    if (isNotEmpty(node)) {
                        throw new HttpException(`key:${body.key} 已存在`, HttpStatus.BAD_REQUEST)
                    }
                    return node
                })
            })
            await this.database.create(ctx.manager.getRepository(schema.WindowsResourceSheet), {
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

    /**编辑操作按钮**/
    @AutoDescriptor
    public async httpBaseSystemUpdateSheet(request: OmixRequest, body: windows.UpdateSheetOptions) {
        const ctx = await this.database.transaction()
        try {
            await this.database.empty(this.windows.resourceSheet, {
                request,
                message: 'keyId不存在',
                dispatch: { where: { keyId: body.keyId } }
            })
            await this.database.empty(this.windows.resource, {
                request,
                message: 'pid不存在',
                dispatch: { where: { keyId: body.pid } }
            })
            await this.database.builder(this.windows.resourceSheet, async qb => {
                qb.where(`t.pid = :pid AND t.key = :key`, { pid: body.pid, key: body.key })
                return await qb.getOne().then(async node => {
                    if (isNotEmpty(node) && node.keyId !== body.keyId) {
                        throw new HttpException(`key:${body.key} 已存在`, HttpStatus.BAD_REQUEST)
                    }
                    return node
                })
            })
            await this.database.update(ctx.manager.getRepository(schema.WindowsResourceSheet), {
                request,
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

    /**操作按钮详情**/
    @AutoDescriptor
    public async httpBaseSystemSheetResolver(request: OmixRequest, body: windows.SheetResolverOptions) {
        try {
            return await this.database.empty(this.windows.resourceSheet, {
                request,
                message: 'keyId不存在',
                dispatch: { where: { keyId: body.keyId } }
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        }
    }

    /**操作按钮列表**/
    @AutoDescriptor
    public async httpBaseSystemColumnSheet(request: OmixRequest, body: windows.ColumnSheetOptions) {
        try {
            return await this.database.builder(this.windows.resourceSheet, async qb => {
                qb.skip((body.page - 1) * body.size)
                qb.take(body.size)
                if (isNotEmpty(body.pid)) {
                    qb.andWhere(`t.pid = :pid`, { pid: body.pid })
                }
                if (isNotEmpty(body.status)) {
                    qb.andWhere(`t.status = :status`, { status: body.status })
                }
                if (isNotEmpty(body.vague)) {
                    qb.andWhere(`(t.name LIKE :vague OR t.key LIKE :vague)`, { vague: `%${body.vague}%` })
                }
                return await qb.getManyAndCount().then(async ([list, total]) => {
                    return await this.fetchResolver({ list, total })
                })
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        }
    }

    /**操作按钮状态变更**/
    @AutoDescriptor
    public async httpBaseSystemSwitchSheet(request: OmixRequest, body: windows.SwitchSheetOptions) {
        const ctx = await this.database.transaction()
        try {
            const keys = body.keys ?? []
            if (keys.length === 0) {
                throw new HttpException('keys 必填', HttpStatus.BAD_REQUEST)
            }
            const nodes = await ctx.manager.getRepository(schema.WindowsResourceSheet).find({ where: { keyId: In(keys) } })
            if (nodes.length !== keys.length) {
                const exists = new Set(nodes.map(n => n.keyId))
                const miss = keys.filter(id => !exists.has(id))
                throw new HttpException(`keyId不存在:${miss.join(',')}`, HttpStatus.BAD_REQUEST)
            }
            await ctx.manager
                .getRepository(schema.WindowsResourceSheet)
                .update({ keyId: In(keys) }, { status: body.status, modifyBy: request.user.uid })
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

    /**删除操作按钮**/
    @AutoDescriptor
    public async httpBaseSystemDeleteSheet(request: OmixRequest, body: windows.DeleteSheetOptions) {
        const ctx = await this.database.transaction()
        try {
            const keys = body.keys ?? []
            if (keys.length === 0) {
                throw new HttpException('keys 必填', HttpStatus.BAD_REQUEST)
            }
            const repo = ctx.manager.getRepository(schema.WindowsResourceSheet)
            const nodes = await repo.find({ where: { keyId: In(keys) } })
            if (nodes.length !== keys.length) {
                const exists = new Set(nodes.map(n => n.keyId))
                const miss = keys.filter(id => !exists.has(id))
                throw new HttpException(`keyId不存在:${miss.join(',')}`, HttpStatus.BAD_REQUEST)
            }
            await ctx.manager.getRepository(schema.WindowsRoleSheet).delete({ sheetId: In(keys) })
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

    /**新增接口权限**/
    @AutoDescriptor
    public async httpBaseSystemCreateApifox(request: OmixRequest, body: windows.CreateApifoxOptions) {
        const ctx = await this.database.transaction()
        try {
            await this.database.empty(this.windows.resource, {
                request,
                message: 'pid不存在',
                dispatch: { where: { keyId: body.pid } }
            })
            await this.database.builder(this.windows.resourceApifox, async qb => {
                qb.where(`t.pid = :pid AND t.path = :path AND t.method = :method`, { pid: body.pid, path: body.path, method: body.method })
                return await qb.getOne().then(async node => {
                    if (isNotEmpty(node)) {
                        throw new HttpException(`接口 ${body.method}:${body.path} 已存在`, HttpStatus.BAD_REQUEST)
                    }
                    return node
                })
            })
            await this.database.create(ctx.manager.getRepository(schema.WindowsResourceApifox), {
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

    /**编辑接口权限**/
    @AutoDescriptor
    public async httpBaseSystemUpdateApifox(request: OmixRequest, body: windows.UpdateApifoxOptions) {
        const ctx = await this.database.transaction()
        try {
            await this.database.empty(this.windows.resourceApifox, {
                request,
                message: 'keyId不存在',
                dispatch: { where: { keyId: body.keyId } }
            })
            await this.database.empty(this.windows.resource, {
                request,
                message: 'pid不存在',
                dispatch: { where: { keyId: body.pid } }
            })
            await this.database.builder(this.windows.resourceApifox, async qb => {
                qb.where(`t.pid = :pid AND t.path = :path AND t.method = :method`, { pid: body.pid, path: body.path, method: body.method })
                return await qb.getOne().then(async node => {
                    if (isNotEmpty(node) && node.keyId !== body.keyId) {
                        throw new HttpException(`接口 ${body.method}:${body.path} 已存在`, HttpStatus.BAD_REQUEST)
                    }
                    return node
                })
            })
            await this.database.update(ctx.manager.getRepository(schema.WindowsResourceApifox), {
                request,
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

    /**接口权限详情**/
    @AutoDescriptor
    public async httpBaseSystemApifoxResolver(request: OmixRequest, body: windows.ApifoxResolverOptions) {
        try {
            return await this.database.empty(this.windows.resourceApifox, {
                request,
                message: 'keyId不存在',
                dispatch: { where: { keyId: body.keyId } }
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        }
    }

    /**接口权限列表**/
    @AutoDescriptor
    public async httpBaseSystemColumnApifox(request: OmixRequest, body: windows.ColumnApifoxOptions) {
        try {
            return await this.database.builder(this.windows.resourceApifox, async qb => {
                qb.skip((body.page - 1) * body.size)
                qb.take(body.size)
                if (isNotEmpty(body.pid)) {
                    qb.andWhere(`t.pid = :pid`, { pid: body.pid })
                }
                if (isNotEmpty(body.status)) {
                    qb.andWhere(`t.status = :status`, { status: body.status })
                }
                if (isNotEmpty(body.method)) {
                    qb.andWhere(`t.method = :method`, { method: body.method })
                }
                if (isNotEmpty(body.vague)) {
                    qb.andWhere(`(t.name LIKE :vague OR t.path LIKE :vague)`, { vague: `%${body.vague}%` })
                }
                return await qb.getManyAndCount().then(async ([list, total]) => {
                    return await this.fetchResolver({ list, total })
                })
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        }
    }

    /**接口权限状态变更**/
    @AutoDescriptor
    public async httpBaseSystemSwitchApifox(request: OmixRequest, body: windows.SwitchApifoxOptions) {
        const ctx = await this.database.transaction()
        try {
            const keys = body.keys ?? []
            if (keys.length === 0) {
                throw new HttpException('keys 必填', HttpStatus.BAD_REQUEST)
            }
            const nodes = await ctx.manager.getRepository(schema.WindowsResourceApifox).find({ where: { keyId: In(keys) } })
            if (nodes.length !== keys.length) {
                const exists = new Set(nodes.map(n => n.keyId))
                const miss = keys.filter(id => !exists.has(id))
                throw new HttpException(`keyId不存在:${miss.join(',')}`, HttpStatus.BAD_REQUEST)
            }
            await ctx.manager
                .getRepository(schema.WindowsResourceApifox)
                .update({ keyId: In(keys) }, { status: body.status, modifyBy: request.user.uid })
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

    /**删除接口权限**/
    @AutoDescriptor
    public async httpBaseSystemDeleteApifox(request: OmixRequest, body: windows.DeleteApifoxOptions) {
        const ctx = await this.database.transaction()
        try {
            const keys = body.keys ?? []
            if (keys.length === 0) {
                throw new HttpException('keys 必填', HttpStatus.BAD_REQUEST)
            }
            const repo = ctx.manager.getRepository(schema.WindowsResourceApifox)
            const nodes = await repo.find({ where: { keyId: In(keys) } })
            if (nodes.length !== keys.length) {
                const exists = new Set(nodes.map(n => n.keyId))
                const miss = keys.filter(id => !exists.has(id))
                throw new HttpException(`keyId不存在:${miss.join(',')}`, HttpStatus.BAD_REQUEST)
            }
            await ctx.manager.getRepository(schema.WindowsRoleApifox).delete({ apifoxId: In(keys) })
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
