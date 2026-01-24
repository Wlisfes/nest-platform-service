import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { DataBaseService, WindowsService, schema, enums } from '@/modules/database/database.service'
import { OmixRequest } from '@/interface'
import { isEmpty, isNotEmpty } from 'class-validator'
import { faker, fetchHandler, fetchTreeNodeBlock, fetchIntNumber } from '@/utils'
import { In, Not } from 'typeorm'
import * as tree from 'tree-tool'
import * as windows from '@web-windows-server/interface'

@Injectable()
export class SheetService extends Logger {
    constructor(private readonly database: DataBaseService, private readonly windows: WindowsService) {
        super()
    }

    /**添加菜单**/
    @AutoDescriptor
    public async httpBaseSystemCreateSheetResource(request: OmixRequest, body: windows.CreateSheetResourceOptions) {
        const ctx = await this.database.transaction()
        try {
            await this.database.empty(this.windows.sheetOptions, {
                next: isNotEmpty(body.pid),
                request,
                message: 'pid:不存在',
                dispatch: { where: { id: body.pid } }
            })
            await this.database.builder(this.windows.sheetOptions, async qb => {
                qb.where(`t.keyName = :keyName OR t.router = :router`, { keyName: body.keyName, router: body.router })
                return await qb.getOne().then(async node => {
                    if (isNotEmpty(node?.keyName)) {
                        throw new HttpException(`keyName:已存在`, HttpStatus.BAD_REQUEST)
                    } else if (isNotEmpty(node?.router)) {
                        throw new HttpException(`router:已存在`, HttpStatus.BAD_REQUEST)
                    }
                    return node
                })
            })
            await this.database.create(ctx.manager.getRepository(schema.WindowsSheet), {
                request,
                stack: this.stack,
                body: Object.assign(body, {
                    id: await fetchIntNumber(),
                    createBy: request.user.uid,
                    chunk: enums.CHUNK_WINDOWS_SHEET_CHUNK.resource.value
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

    /**编辑菜单**/
    @AutoDescriptor
    public async httpBaseSystemUpdateSheetResource(request: OmixRequest, body: windows.UpdateSheetResourceOptions) {
        const ctx = await this.database.transaction()
        try {
            await this.database.empty(this.windows.sheetOptions, {
                next: isNotEmpty(body.id),
                request,
                message: 'id:不存在',
                dispatch: { where: { id: body.id } }
            })
            await this.database.empty(this.windows.sheetOptions, {
                next: isNotEmpty(body.pid),
                request,
                message: 'pid:不存在',
                dispatch: { where: { id: body.pid } }
            })
            await this.database.notempty(this.windows.sheetOptions, {
                request,
                message: 'keyName:已存在',
                dispatch: { where: { keyName: body.keyName, id: Not(body.id) } }
            })
            await this.database.notempty(this.windows.sheetOptions, {
                request,
                message: 'router:已存在',
                dispatch: { where: { router: body.router, id: Not(body.id) } }
            })
            await this.database.update(ctx.manager.getRepository(schema.WindowsSheet), {
                request,
                stack: this.stack,
                where: { id: body.id },
                body: Object.assign(body, {
                    modifyBy: request.user.uid,
                    chunk: enums.CHUNK_WINDOWS_SHEET_CHUNK.resource.value
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

    /**菜单、按钮详情**/
    @AutoDescriptor
    public async httpBaseSystemSheetResolver(request: OmixRequest, body: windows.BasicSheetOptions) {
        try {
            return await this.database.empty(this.windows.sheetOptions, {
                request,
                message: 'id:不存在',
                dispatch: { where: { id: body.id } }
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        }
    }

    /**菜单列表**/
    @AutoDescriptor
    public async httpBaseSystemColumnSheetResource(request: OmixRequest, body: windows.ColumnSheetResourceOptions) {
        try {
            return await this.database.builder(this.windows.sheetOptions, async qb => {
                return await qb.getMany().then(async nodes => {
                    const items = fetchTreeNodeBlock(tree.fromList(nodes, { id: 'id', pid: 'pid' }))
                    return await this.fetchResolver({ list: items })
                })
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        }
    }

    /**添加按钮权限**/
    @AutoDescriptor
    public async httpBaseSystemCreateSheetAuthorize(request: OmixRequest, body: windows.CreateSheetAuthorizeOptions) {
        const ctx = await this.database.transaction()
        try {
            await this.database.empty(this.windows.sheetOptions, {
                next: isNotEmpty(body.pid),
                request,
                message: 'pid:不存在',
                dispatch: { where: { id: body.pid } }
            })
            await this.database.notempty(this.windows.sheetOptions, {
                request,
                message: 'keyName:已存在',
                dispatch: { where: { keyName: body.keyName } }
            })
            await this.database.create(ctx.manager.getRepository(schema.WindowsSheet), {
                request,
                stack: this.stack,
                body: Object.assign(body, {
                    id: await fetchIntNumber(),
                    createBy: request.user.uid,
                    check: enums.CHUNK_WINDOWS_SHEET_CHECK.show.value,
                    chunk: enums.CHUNK_WINDOWS_SHEET_CHUNK.authorize
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

    /**编辑按钮权限**/
    @AutoDescriptor
    public async httpBaseSystemUpdateSheetAuthorize(request: OmixRequest, body: windows.UpdateSheetAuthorizeOptions) {
        // return await this.sheetService.httpBaseSystemCreateSheet(request, body)
    }
}
