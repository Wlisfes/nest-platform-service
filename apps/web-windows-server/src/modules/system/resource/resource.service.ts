import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
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
        const ctx = await this.database.fetchConnectTransaction()
        try {
            await this.database.fetchConnectBuilder(this.windows.resource, async qb => {
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
            await this.database.fetchConnectNotNull(this.windows.resource, {
                next: isNotEmpty(body.pid),
                request,
                message: 'pid不存在',
                dispatch: { where: { keyId: body.pid } }
            })
            await this.database.fetchConnectCreate(ctx.manager.getRepository(schema.WindowsResource), {
                request,
                deplayName: this.deplayName,
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
        const ctx = await this.database.fetchConnectTransaction()
        try {
            await this.database.fetchConnectNotNull(this.windows.resource, {
                request,
                message: 'keyId不存在',
                dispatch: { where: { keyId: body.keyId } }
            })
            await this.database.fetchConnectBuilder(this.windows.resource, async qb => {
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
            await this.database.fetchConnectNotNull(this.windows.resource, {
                next: isNotEmpty(body.pid),
                request,
                message: 'pid不存在',
                dispatch: { where: { keyId: body.pid } }
            })
            await this.database.fetchConnectUpdate(ctx.manager.getRepository(schema.WindowsResource), {
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

    /**菜单资源列表**/
    @AutoDescriptor
    public async httpBaseSystemColumnResource(request: OmixRequest, body: windows.ColumnResourceOptions) {
        try {
            return await this.database.fetchConnectBuilder(this.windows.resource, async qb => {
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
        const ctx = await this.database.fetchConnectTransaction()
        try {
            await this.database.fetchConnectBatchNotNull(this.windows.resource, {
                request,
                message: 'keyId不存在',
                dispatch: { where: body.keys.map(keyId => ({ keyId })) }
            })
            await this.database.fetchConnectInsert(ctx.manager.getRepository(schema.WindowsResource), {
                request,
                deplayName: this.deplayName,
                body: body.keys.map(keyId => ({ keyId, status: body.status }))
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

    /**删除菜单资源**/
    @AutoDescriptor
    public async httpBaseSystemDeleteResource(request: OmixRequest, body: windows.DeleteResourceOptions) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        } finally {
            await ctx.release()
        }
    }
}
