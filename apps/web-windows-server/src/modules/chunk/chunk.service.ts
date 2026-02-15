import { Injectable, HttpException } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { DataBaseService, WindowsService, schema, enums } from '@/modules/database/database.service'
import { OmixRequest } from '@/interface'
import { pick } from 'lodash'
import * as windows from '@web-windows-server/interface'

@Injectable()
export class ChunkService extends Logger {
    constructor(private readonly database: DataBaseService, private readonly windows: WindowsService) {
        super()
    }

    /**通用下拉字典**/
    @AutoDescriptor
    public async httpBaseChunkSelect(request: OmixRequest, body: windows.ChunkSelectOptions) {
        try {
            return await this.fetchResolver(
                body.type.reduce((obs, key: string) => ({ ...obs, [key]: Object.values(windows.COMMON_CHUNK[key].columns) }), {})
            )
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        }
    }

    /**更新搜索栏字段配置**/
    @AutoDescriptor
    public async httpBaseUpdateChunkSearch(request: OmixRequest, body: windows.UpdateChunkOptions) {
        const ctx = await this.database.transaction()
        try {
            const repository = ctx.manager.getRepository(schema.WindowsChunk)
            await repository.delete({ keyName: body.keyName, chunk: enums.CHUNK_WINDOWS_COMMON_CHUNK.search.value })
            if (body.fields.length > 0) {
                const entities = body.fields.map(field => ({
                    keyName: body.keyName,
                    chunk: enums.CHUNK_WINDOWS_COMMON_CHUNK.search.value,
                    prop: field.prop,
                    label: field.label,
                    check: field.check,
                    createBy: request.user.uid,
                    modifyBy: request.user.uid
                }))
                await repository.insert(entities)
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

    /**更新表头字段配置**/
    @AutoDescriptor
    public async httpBaseUpdateChunkColumns(request: OmixRequest, body: windows.UpdateChunkOptions) {
        const ctx = await this.database.transaction()
        try {
            const repository = ctx.manager.getRepository(schema.WindowsChunk)
            await repository.delete({ keyName: body.keyName, chunk: enums.CHUNK_WINDOWS_COMMON_CHUNK.columns.value })
            if (body.fields.length > 0) {
                const entities = body.fields.map(field => ({
                    keyName: body.keyName,
                    chunk: enums.CHUNK_WINDOWS_COMMON_CHUNK.columns.value,
                    prop: field.prop,
                    label: field.label,
                    check: field.check,
                    createBy: request.user.uid,
                    modifyBy: request.user.uid
                }))
                await repository.insert(entities)
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

    /**查询字段配置**/
    @AutoDescriptor
    public async httpBaseColumnChunkCustomize(request: OmixRequest, body: windows.ColumnChunkOptions) {
        try {
            return await this.database.builder(this.windows.chunkOptions, async qb => {
                qb.where('t.keyName = :keyName', { keyName: body.keyName })
                return await qb.getMany().then(async list => {
                    const database = list.filter(item => item.chunk === enums.CHUNK_WINDOWS_COMMON_CHUNK.search.value)
                    const customize = list.filter(item => item.chunk === enums.CHUNK_WINDOWS_COMMON_CHUNK.columns.value)
                    return await this.fetchResolver({
                        database: database.map(item => pick(item, ['check', 'prop', 'label'])),
                        customize: customize.map(item => pick(item, ['check', 'prop', 'label']))
                    })
                })
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        }
    }
}
