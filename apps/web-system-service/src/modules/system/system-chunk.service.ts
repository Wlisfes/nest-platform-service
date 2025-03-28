import { Injectable } from '@nestjs/common'
import { Not } from 'typeorm'
import { Logger } from '@/modules/logger/logger.service'
import { RedisService } from '@/modules/redis/redis.service'
import { DatabaseService } from '@/modules/database/database.service'
import { Omix, OmixRequest } from '@/interface/instance.resolver'
import * as field from '@web-system-service/interface/instance.resolver'
import * as schema from '@/modules/database/database.schema'
import * as enums from '@/modules/database/database.enums'
import * as utils from '@/utils/utils-common'

@Injectable()
export class SystemChunkService extends Logger {
    constructor(private readonly redisService: RedisService, private readonly database: DatabaseService) {
        super()
    }

    /**刷新redis字典缓存**/
    public async fetchBaseUpdateRedisSystemChunk(request: OmixRequest, body: field.BaseUpdateRedisSystemChunk) {
        try {
            return await this.redisService.setStore({
                data: body.value,
                key: ['SCHEMA_CHUNK_OPTIONS', body.type, body.value].join(':')
            })
        } catch (err) {
            return await this.fetchCatchCompiler('SystemChunkService:fetchBaseUpdateRedisSystemChunk', err)
        }
    }

    /**查询字典类型列表**/
    public async httpBaseChaxunSystemChunk<
        T extends schema.SchemaChunk,
        K extends keyof T,
        R extends Record<keyof typeof enums.SCHEMA_CHUNK_OPTIONS, Array<T>>
    >(request: OmixRequest, body: field.BaseChaxunSystemChunk<T, K>): Promise<Omix<R>> {
        try {
            const keys = Object.keys(utils.omit(body, ['field'])) as Array<keyof R>
            const chunk = Object.keys(enums.SCHEMA_CHUNK_OPTIONS).reduce((o, k) => ({ ...o, [k]: [] }), {}) as Omix<R>
            return await this.database.fetchConnectBuilder(this.database.schemaChunk, async qb => {
                await qb.where(`t.type IN(:keys)`, { keys })
                await this.database.fetchSelection(qb, [
                    ['t', [...new Set(['type', 'name', 'value', 'json', ...((body.field ?? []) as Array<string>)])]]
                ])
                return await qb.getMany().then(async list => {
                    list.forEach(item => chunk[item.type].push(item))
                    return chunk
                })
            })
        } catch (err) {
            return (await this.fetchCatchCompiler('SystemChunkService:httpBaseChaxunSystemChunk', err)) as never as Omix<R>
        }
    }

    /**新增字典**/
    public async httpBaseCreateSystemChunk(request: OmixRequest, body: field.BaseCreateSystemChunk) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
            await this.database.fetchConnectNull(this.database.schemaChunk, {
                message: `value:${body.value} 已存在`,
                dispatch: { where: { value: body.value, type: body.type } }
            })
            await this.database.fetchConnectCreate(this.database.schemaChunk, {
                body: Object.assign(body, { keyId: await utils.fetchIntNumber(), uid: request.user.uid })
            })
            return await ctx.commitTransaction().then(async () => {
                await this.fetchBaseUpdateRedisSystemChunk(request, {
                    type: body.type as keyof typeof enums.SCHEMA_CHUNK_OPTIONS,
                    value: body.value
                })
                return await this.fetchResolver({ message: '新增成功' })
            })
        } catch (err) {
            await ctx.rollbackTransaction()
            return await this.fetchCatchCompiler('SystemChunkService:httpBaseCreateSystemChunk', err)
        } finally {
            await ctx.release()
        }
    }

    /**字典列表**/
    public async httpBaseColumnSystemChunk(request: OmixRequest, body: field.BaseColumnSystemChunk) {
        try {
            return await this.database.fetchConnectBuilder(this.database.schemaChunk, async qb => {
                await qb.leftJoinAndMapOne('t.user', schema.SchemaUser, 'user', 'user.uid = t.uid')
                await this.database.fetchSelection(qb, [
                    ['t', ['uid', 'pid', 'name', 'value', 'type', 'status', 'disabled', 'comment', 'json']],
                    ['t', ['id', 'keyId', 'createTime', 'modifyTime']],
                    ['user', ['uid', 'name', 'status', 'id']]
                ])
                await this.database.fetchBrackets(utils.isNotEmpty(body.vague), function () {
                    return qb.where(`t.keyId LIKE :vague OR t.name LIKE :vague OR t.value LIKE :vague`, {
                        vague: `%${body.vague}%`
                    })
                })
                await this.database.fetchBrackets(utils.isNotEmpty(body.type), () => {
                    return qb.andWhere('t.type = :type', { type: body.type })
                })
                await this.database.fetchBrackets(utils.isNotEmpty(body.name), () => {
                    return qb.andWhere('t.name = :name', { name: body.name })
                })
                await this.database.fetchBrackets(utils.isNotEmpty(body.value), () => {
                    return qb.andWhere('t.value = :value', { value: body.value })
                })
                await this.database.fetchBrackets(utils.isNotEmpty(body.status), () => {
                    return qb.andWhere('t.status = :status', { status: body.status })
                })
                await this.database.fetchBrackets(utils.isNotEmpty(body.uid), () => {
                    return qb.andWhere('t.uid = :uid', { uid: body.uid })
                })
                await this.database.fetchBrackets(utils.isNotEmpty(body.startTime) && utils.isNotEmpty(body.endTime)).then(async where => {
                    if (where) {
                        return qb.andWhere('t.modifyTime >= :startTime AND t.modifyTime <= :endTime', {
                            startTime: body.startTime,
                            endTime: body.endTime
                        })
                    } else if (utils.isNotEmpty(body.startTime)) {
                        qb.andWhere('t.modifyTime >= :startTime', { startTime: body.startTime })
                    } else if (utils.isNotEmpty(body.endTime)) {
                        qb.andWhere('t.modifyTime <= :endTime', { endTime: body.endTime })
                    }
                })
                await qb.orderBy({ 't.id': 'DESC' })
                await qb.offset((body.page - 1) * body.size)
                await qb.limit(body.size)
                return await qb.getManyAndCount().then(async ([list = [], total = 0]) => {
                    return await this.fetchResolver({
                        message: '操作成功',
                        total,
                        list: list.map(item => ({
                            ...item,
                            type: utils.fetchColumn(enums.SCHEMA_CHUNK_OPTIONS, item.type),
                            status: utils.fetchColumn(enums.SCHEMA_CHUNK_STATUS_OPTIONS, item.status)
                        }))
                    })
                })
            })
        } catch (err) {
            return await this.fetchCatchCompiler('SystemChunkService:httpBaseCreateSystemChunk', err)
        }
    }

    /**编辑字典**/
    public async httpBaseUpdateSystemChunk(request: OmixRequest, body: field.BaseUpdateSystemChunk) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
            await this.database.fetchConnectNotNull(this.database.schemaChunk, {
                message: `keyId:${body.keyId} 不存在`,
                dispatch: { where: { keyId: body.keyId } }
            })
            await this.database.fetchConnectNull(this.database.schemaChunk, {
                message: `value:${body.value} 已存在`,
                dispatch: { where: { value: body.value, type: body.type, keyId: Not(body.keyId) } }
            })
            await this.database.fetchConnectUpdate(this.database.schemaChunk, {
                where: { keyId: body.keyId },
                body: Object.assign(body, { uid: request.user.uid })
            })
            return await ctx.commitTransaction().then(async () => {
                await this.fetchBaseUpdateRedisSystemChunk(request, {
                    type: body.type as keyof typeof enums.SCHEMA_CHUNK_OPTIONS,
                    value: body.value
                })
                return await this.fetchResolver({ message: '操作成功' })
            })
        } catch (err) {
            await ctx.rollbackTransaction()
            return await this.fetchCatchCompiler('SystemChunkService:httpBaseUpdateSystemChunk', err)
        } finally {
            await ctx.release()
        }
    }

    /**编辑字典状态**/
    public async httpBaseUpdateSwitchSystemChunk(request: OmixRequest, body: field.BaseSwitchSystemChunk) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
            await this.database.fetchConnectNotNull(this.database.schemaChunk, {
                message: `keyId:${body.keyId} 不存在`,
                dispatch: { where: { keyId: body.keyId } }
            })
            await this.database.fetchConnectUpdate(this.database.schemaChunk, {
                where: { keyId: body.keyId },
                body: { status: body.status, uid: request.user.uid }
            })
            return await ctx.commitTransaction().then(async () => {
                return await this.fetchResolver({ message: '操作成功' })
            })
        } catch (err) {
            await ctx.rollbackTransaction()
            return await this.fetchCatchCompiler('SystemRoleService:httpBaseUpdateSwitchSystemChunk', err)
        } finally {
            await ctx.release()
        }
    }
}
