import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { DataBaseService, WindowsService, schema, enums } from '@/modules/database/database.service'
import { OmixRequest } from '@/interface'
import { isEmpty, isNotEmpty } from 'class-validator'
import { faker, fetchHandler, fetchTreeNodeBlock, fetchIntNumber } from '@/utils'
import { In } from 'typeorm'
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
                const node = await qb.where(`t.keyName = :keyName`, { keyName: body.keyName }).getOne()
                return fetchHandler(isNotEmpty(node), () => {
                    throw new HttpException(`keyName:已存在`, HttpStatus.BAD_REQUEST)
                })
            })
            await this.database.create(ctx.manager.getRepository(schema.WindowsSheet), {
                request,
                stack: this.stack,
                body: Object.assign(body, {
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
            await this.database.builder(this.windows.sheetOptions, async qb => {
                qb.where(`t.keyName = :keyName OR t.router = :router`, { keyName: body.keyName, router: body.router })
                await qb.getOne().then(async node => {
                    if (isNotEmpty(node) && node.id !== body.id && node.keyName == body.keyName) {
                        throw new HttpException(`keyName:已存在`, HttpStatus.BAD_REQUEST)
                    } else if (isNotEmpty(node) && node.id !== body.id && node.router === body.router) {
                        throw new HttpException(`router:已存在`, HttpStatus.BAD_REQUEST)
                    }
                    return node
                })
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

    /**菜单详情**/
    @AutoDescriptor
    public async httpBaseSystemBasicSheetResource(request: OmixRequest, body: windows.BasicSheetResourceOptions) {
        try {
            return await this.database.builder(this.windows.sheetOptions, async qb => {
                const node = await qb.where(`t.id = :id`, { id: body.id }).getOne()
                if (isEmpty(node)) {
                    throw new HttpException('id:不存在', HttpStatus.BAD_REQUEST)
                }
                return await this.fetchResolver({ message: '操作成功', data: node })
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
                const node = await qb.where(`t.id = :id`, { id: body.id }).getOne()
                if (isEmpty(node)) {
                    throw new HttpException('id:不存在', HttpStatus.BAD_REQUEST)
                }
                return await this.fetchResolver({ message: '操作成功', data: node })
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        }
    }
}
