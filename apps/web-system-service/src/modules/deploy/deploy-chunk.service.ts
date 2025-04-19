import { Injectable } from '@nestjs/common'
import { Logger, AutoMethodDescriptor } from '@/modules/logger/logger.service'
import { DatabaseService } from '@/modules/database/database.service'
import { Omix, OmixRequest } from '@/interface/instance.resolver'
import * as field from '@web-system-service/interface/instance.resolver'
import * as schema from '@/modules/database/database.schema'
import * as enums from '@/modules/database/database.enums'
import * as utils from '@/utils/utils-common'

@Injectable()
export class DeployChunkService extends Logger {
    constructor(private readonly database: DatabaseService) {
        super()
    }

    /**遍历静态字典**/
    @AutoMethodDescriptor
    public async httpBaseDeployChunkStatic<R extends field.BaseSchemaChunk>(request: OmixRequest, body: field.BaseDeployChunkStatic) {
        /**遍历所有字典类型key**/
        const keys = Object.keys(utils.omit(body, ['field', 'deplayName'])) as Array<field.ChunkTypes>
        /**分离动态字典类型**/
        const dynamic = keys.filter(key => Object.keys(enums.DYNAMIC_SCHEMA_CHUNK_OPTIONS).includes(key))
        /**分离静态字典类型**/
        const statics = keys.filter(key => Object.keys(enums.STATIC_SCHEMA_CHUNK_OPTIONS).includes(key))
        /**聚合静态类型数据**/
        const chunk = statics.reduce((ocs, key) => ({ ...ocs, [key]: Object.values(enums[key] ?? {}) }), {}) as Omix<R>
        return { chunk, dynamic }
    }

    /**查询动态态字典**/
    @AutoMethodDescriptor
    public async httpBaseDeployChunkDynamic(request: OmixRequest, keys: Array<field.ChunkTypes>, field: Array<string> = []) {
        const chunk = keys.reduce((ocs, k) => ({ ...ocs, [k]: [] }), {}) as Omix<Record<field.ChunkTypes, schema.SchemaChunk>>
        return await this.database.fetchConnectBuilder(this.database.schemaChunk, async qb => {
            await qb.where(`t.type IN(:keys)`, { keys })
            await this.database.fetchSelection(qb, [['t', [...new Set(['keyId', 'type', 'name', 'value', 'json', ...field])]]])
            return await qb.getMany().then(async list => {
                list.forEach(item => chunk[item.type].push(item))
                return chunk
            })
        })
    }

    /**查询字典类型列表**/
    @AutoMethodDescriptor
    public async httpBaseDeployChaxunChunk<R extends Record<field.ChunkTypes, schema.SchemaChunk>>(
        request: OmixRequest,
        body: field.BaseDeployChaxunChunk
    ): Promise<Omix<R>> {
        try {
            return await this.httpBaseDeployChunkStatic(request, body).then(async ({ chunk, dynamic }) => {
                if (dynamic.length === 0) return chunk
                return await this.httpBaseDeployChunkDynamic(request, dynamic, body.field).then(data => {
                    return Object.assign(chunk, data)
                })
            })
        } catch (err) {
            return (await this.fetchCatchCompiler(body.deplayName || this.deplayName, err)) as never as Omix<R>
        }
    }
}
