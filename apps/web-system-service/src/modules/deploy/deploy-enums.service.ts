import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Logger, AutoMethodDescriptor } from '@/modules/logger/logger.service'
import { RedisService } from '@/modules/redis/redis.service'
import { DatabaseService } from '@/modules/database/database.service'
import { Omix, OmixRequest } from '@/interface/instance.resolver'
import * as field from '@web-system-service/interface/instance.resolver'
import * as schema from '@/modules/database/database.schema'
import * as enums from '@/modules/database/database.enums'
import * as utils from '@/utils/utils-common'

@Injectable()
export class DeployEnumsService extends Logger {
    constructor(private readonly redisService: RedisService, private readonly database: DatabaseService) {
        super()
    }

    /**刷新redis枚举缓存**/
    @AutoMethodDescriptor
    public async fetchBaseDeployRedisEnumsUpdate(request: OmixRequest, body: field.BaseUpdateRedisSystemEnums) {
        try {
            return await this.redisService.setStore(request, {
                deplayName: this.deplayName,
                data: body.value,
                key: ['deploy:enums', body.type, body.value].join(':')
            })
        } catch (err) {
            return await this.fetchCatchCompiler(this.deplayName, err)
        }
    }

    /**验证枚举值缓存是否合规: 不合规会抛出异常**/
    @AutoMethodDescriptor
    public async fetchBaseDeployRedisEnumsCheck(request: OmixRequest, body: field.BaseDeployRedisEnumsCheck) {
        try {
            const value = await this.redisService.getStore<string>(request, {
                logger: true,
                key: ['deploy:enums', body.type, body.value].join(':'),
                deplayName: body.deplayName || this.deplayName
            })
            if (utils.isEmpty(value) || body.value !== value) {
                throw new HttpException(body.message || '参数格式错误', HttpStatus.BAD_REQUEST)
            }
            return await this.fetchResolver({ value })
        } catch (err) {
            return await this.fetchCatchCompiler(body.deplayName || this.deplayName, err)
        }
    }

    /**获取枚举来源类型**/
    @AutoMethodDescriptor
    public async httpBaseDeployEnumsSource(request: OmixRequest) {
        return Object.assign(Object.values(enums.DYNAMIC_SCHEMA_CHUNK_OPTIONS), Object.values(enums.STATIC_SCHEMA_CHUNK_OPTIONS))
    }

    /**遍历静态枚举**/
    @AutoMethodDescriptor
    public async httpBaseDeployEnumsStatic<R extends field.BaseSchemaEnums>(request: OmixRequest, body: field.BaseDeployEnumsStatic) {
        /**遍历所有枚举类型key**/
        const keys = Object.keys(utils.omit(body, ['field', 'deplayName'])) as Array<field.EnumsTypes>
        /**分离动态枚举类型**/
        const dynamic = keys.filter(key => Object.keys(enums.DYNAMIC_SCHEMA_CHUNK_OPTIONS).includes(key))
        /**分离静态枚举类型**/
        const statics = keys.filter(key => Object.keys(enums.STATIC_SCHEMA_CHUNK_OPTIONS).includes(key))
        /**聚合静态类型数据**/
        const chunk = statics.reduce((ocs, key) => ({ ...ocs, [key]: Object.values(enums[key] ?? {}) }), {}) as Omix<R>
        return { chunk, dynamic }
    }

    /**查询动态态枚举**/
    @AutoMethodDescriptor
    public async httpBaseDeployEnumsDynamic(request: OmixRequest, keys: Array<field.EnumsTypes>, field: Array<string> = []) {
        const chunk = keys.reduce((ocs, k) => ({ ...ocs, [k]: [] }), {}) as Omix<Record<field.EnumsTypes, schema.SchemaChunk>>
        return await this.database.fetchConnectBuilder(this.database.schemaChunk, async qb => {
            await qb.where(`t.type IN(:keys)`, { keys })
            await this.database.fetchSelection(qb, [['t', [...new Set(['keyId', 'type', 'name', 'value', 'json', ...field])]]])
            return await qb.getMany().then(async list => {
                list.forEach(item => chunk[item.type].push(item))
                return chunk
            })
        })
    }

    /**查询枚举类型列表**/
    @AutoMethodDescriptor
    public async httpBaseDeployEnumsCompose<R extends Record<field.EnumsTypes, schema.SchemaChunk>>(
        request: OmixRequest,
        body: field.BaseDeployEnumsCompose
    ): Promise<Omix<R>> {
        try {
            return await this.httpBaseDeployEnumsStatic(request, body).then(async ({ chunk, dynamic }) => {
                if (dynamic.length === 0) return chunk
                return await this.httpBaseDeployEnumsDynamic(request, dynamic, body.field).then(data => {
                    return Object.assign(chunk, data)
                })
            })
        } catch (err) {
            return (await this.fetchCatchCompiler(body.deplayName || this.deplayName, err)) as never as Omix<R>
        }
    }

    /**查询枚举类型列表**/
    @AutoMethodDescriptor
    public async httpBaseDeployEnumsCompiler(request: OmixRequest, body: field.BaseDeployEnumsCompiler) {
        try {
            const keys = [...Object.keys(enums.STATIC_SCHEMA_CHUNK_OPTIONS), ...Object.keys(enums.DYNAMIC_SCHEMA_CHUNK_OPTIONS)]
            const cause = body.type.filter(key => !keys.includes(key))
            if (body.type.length === 0) {
                throw new HttpException('type不可为空', HttpStatus.BAD_REQUEST)
            } else if (cause.length > 0) {
                throw new HttpException('type参数错误', HttpStatus.BAD_REQUEST, { cause })
            }
            return await this.httpBaseDeployEnumsCompose(
                request,
                body.type.reduce((ocs: Omix, key) => ({ ...ocs, [key]: true }), {})
            )
        } catch (err) {
            return await this.fetchCatchCompiler(this.deplayName, err)
        }
    }
}
