import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Not } from 'typeorm'
import { Logger, AutoMethodDescriptor } from '@/modules/logger/logger.service'
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
    @AutoMethodDescriptor
    public async fetchBaseUpdateRedisSystemChunk(request: OmixRequest, body: field.BaseUpdateRedisSystemChunk) {
        try {
            return await this.redisService.setStore(request, {
                deplayName: this.deplayName,
                data: body.value,
                key: ['SCHEMA_CHUNK_OPTIONS', body.type, body.value].join(':')
            })
        } catch (err) {
            return await this.fetchCatchCompiler(this.deplayName, err)
        }
    }

    /**根据keyId验证数据: 不存在会抛出异常**/
    @AutoMethodDescriptor
    public async fetchBaseCheckKeyIdSystemChunk(request: OmixRequest, body: field.BaseCheckKeyIdSystemChunk) {
        return await this.database.fetchConnectNotNull(this.database.schemaChunk, {
            request,
            deplayName: body.deplayName || this.deplayName,
            message: body.message || `keyId:${body.keyId} 不存在`,
            dispatch: { where: { keyId: body.keyId } }
        })
    }

    /**验证字典类型、value是否重复: 重复了会抛出异常**/
    @AutoMethodDescriptor
    public async fetchBaseCheckRepeatSystemChunk(request: OmixRequest, body: field.BaseCheckRepeatSystemChunk) {
        return await this.database.fetchConnectNotNull(this.database.schemaChunk, {
            request,
            deplayName: body.deplayName || this.deplayName,
            message: body.message || `value:${body.value} 已存在`,
            dispatch: {
                where: {
                    value: body.value,
                    type: body.type,
                    ...(utils.isEmpty(body.keyId) ? {} : { keyId: Not(body.keyId) })
                }
            }
        })
    }

    /**验证字典值缓存是否合规: 不合规会抛出异常**/
    @AutoMethodDescriptor
    public async fetchBaseCheckSystemChunk(request: OmixRequest, body: field.BaseCheckSystemChunk) {
        try {
            const value = await this.redisService.getStore<string>(request, {
                logger: true,
                key: ['SCHEMA_CHUNK_OPTIONS', body.type, body.value].join(':'),
                deplayName: body.deplayName || this.deplayName
            })
            if (utils.isEmpty(value) || body.value != value) {
                throw new HttpException(body.message || '参数格式错误', HttpStatus.BAD_REQUEST)
            }
            return await this.fetchResolver({ data: value })
        } catch (err) {
            return await this.fetchCatchCompiler(body.deplayName || this.deplayName, err)
        }
    }

    /**查询字典类型列表**/
    @AutoMethodDescriptor
    public async httpBaseChaxunSystemChunk<
        T extends schema.SchemaChunk,
        K extends keyof T,
        R extends Record<keyof typeof enums.SCHEMA_CHUNK_OPTIONS, Array<T>>
    >(request: OmixRequest, body: field.BaseChaxunSystemChunk<T, K>): Promise<Omix<R>> {
        try {
            const keys = Object.keys(utils.omit(body, ['field', 'deplayName'])) as Array<keyof R>
            const chunk = Object.keys(enums.SCHEMA_CHUNK_OPTIONS).reduce((o, k) => ({ ...o, [k]: [] }), {}) as Omix<R>
            return await this.database.fetchConnectBuilder(this.database.schemaChunk, async qb => {
                await qb.where(`t.type IN(:keys)`, { keys })
                await this.database.fetchSelection(qb, [
                    ['t', [...new Set(['keyId', 'type', 'name', 'value', 'json', ...((body.field ?? []) as Array<string>)])]]
                ])
                return await qb.getMany().then(async list => {
                    list.forEach(item => chunk[item.type].push(item))
                    return chunk
                })
            })
        } catch (err) {
            return (await this.fetchCatchCompiler(body.deplayName || this.deplayName, err)) as never as Omix<R>
        }
    }

    /**新增字典**/
    @AutoMethodDescriptor
    public async httpBaseCreateSystemChunk(request: OmixRequest, body: field.BaseCreateSystemChunk) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
            /**验证类型+value是否重复**/
            await this.fetchBaseCheckRepeatSystemChunk(request, {
                deplayName: this.deplayName,
                message: `value:${body.value} 已存在`,
                type: body.type,
                value: body.value
            })
            /**验证pid父级是否不存在**/
            await utils.fetchHandler(utils.isNotEmpty(body.pid), async () => {
                return await this.fetchBaseCheckKeyIdSystemChunk(request, {
                    keyId: body.pid,
                    deplayName: this.deplayName,
                    message: `pid:${body.pid} 不存在`
                })
            })
            /**验证rule是否不存在**/
            await utils.fetchHandler(utils.isNotEmpty(body.rule), async () => {
                return await this.database.fetchConnectNotNull(this.database.schemaRouter, {
                    deplayName: this.deplayName,
                    request,
                    message: `rule:${body.rule} 不存在`,
                    dispatch: { where: { keyId: body.rule } }
                })
            })
            /**把创建操作插入事务**/
            await this.database.fetchConnectCreate(ctx.manager.getRepository(schema.SchemaChunk), {
                deplayName: this.deplayName,
                request,
                body: Object.assign(body, { keyId: await utils.fetchIntNumber(), uid: request.user.uid })
            })
            /**提交事务**/
            return await ctx.commitTransaction().then(async () => {
                /**事务提交成功后写入redis缓存**/
                await this.fetchBaseUpdateRedisSystemChunk(request, {
                    type: body.type as keyof typeof enums.SCHEMA_CHUNK_OPTIONS,
                    value: body.value
                })
                return await this.fetchResolver({ message: '新增成功' })
            })
        } catch (err) {
            await ctx.rollbackTransaction()
            return await this.fetchCatchCompiler(this.deplayName, err)
        } finally {
            await ctx.release()
        }
    }

    /**字典列表**/
    @AutoMethodDescriptor
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
            return await this.fetchCatchCompiler(this.deplayName, err)
        }
    }

    /**编辑字典**/
    @AutoMethodDescriptor
    public async httpBaseUpdateSystemChunk(request: OmixRequest, body: field.BaseUpdateSystemChunk) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
            /**验证keyId是否不存在**/
            await this.fetchBaseCheckKeyIdSystemChunk(request, {
                keyId: body.keyId,
                deplayName: this.deplayName,
                message: `keyId:${body.keyId} 不存在`
            })
            /**验证类型+value是否重复**/
            await this.fetchBaseCheckRepeatSystemChunk(request, {
                deplayName: this.deplayName,
                message: `value:${body.value} 已存在`,
                type: body.type,
                value: body.value,
                keyId: body.keyId
            })
            /**验证pid父级是否不存在**/
            await utils.fetchHandler(utils.isNotEmpty(body.pid), async () => {
                return await this.fetchBaseCheckKeyIdSystemChunk(request, {
                    keyId: body.pid,
                    deplayName: this.deplayName,
                    message: `pid:${body.pid} 不存在`
                })
            })
            /**验证rule是否不存在**/
            await utils.fetchHandler(utils.isNotEmpty(body.rule), async () => {
                return await this.database.fetchConnectNotNull(this.database.schemaRouter, {
                    deplayName: this.deplayName,
                    request,
                    message: `rule:${body.rule} 不存在`,
                    dispatch: { where: { keyId: body.rule } }
                })
            })
            /**把编辑操作插入事务**/
            await this.database.fetchConnectUpdate(ctx.manager.getRepository(schema.SchemaChunk), {
                deplayName: this.deplayName,
                request,
                where: { keyId: body.keyId },
                body: Object.assign(body, { uid: request.user.uid })
            })
            /**提交事务**/
            return await ctx.commitTransaction().then(async () => {
                /**事务提交成功后写入redis缓存**/
                await this.fetchBaseUpdateRedisSystemChunk(request, {
                    type: body.type as keyof typeof enums.SCHEMA_CHUNK_OPTIONS,
                    value: body.value
                })
                return await this.fetchResolver({ message: '操作成功' })
            })
        } catch (err) {
            await ctx.rollbackTransaction()
            return await this.fetchCatchCompiler(this.deplayName, err)
        } finally {
            await ctx.release()
        }
    }

    /**编辑字典状态**/
    @AutoMethodDescriptor
    public async httpBaseUpdateStateSystemChunk(request: OmixRequest, body: field.BaseUpdateStateSystemChunk) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
            /**验证keyId是否不存在**/
            await this.fetchBaseCheckKeyIdSystemChunk(request, {
                keyId: body.keyId,
                deplayName: this.deplayName,
                message: `keyId:${body.keyId} 不存在`
            })
            /**把编辑操作插入事务**/
            await this.database.fetchConnectUpdate(ctx.manager.getRepository(schema.SchemaChunk), {
                deplayName: this.deplayName,
                request,
                where: { keyId: body.keyId },
                body: Object.assign(body, { uid: request.user.uid })
            })
            /**提交事务**/
            return await ctx.commitTransaction().then(async () => {
                return await this.fetchResolver({ message: '操作成功' })
            })
        } catch (err) {
            await ctx.rollbackTransaction()
            return await this.fetchCatchCompiler(this.deplayName, err)
        } finally {
            await ctx.release()
        }
    }

    /**批量获取字典分类列表**/
    @AutoMethodDescriptor
    public async httpBaseSelectSystemChunk(request: OmixRequest, body: field.BaseSelectSystemChunk) {
        try {
            const cause = body.type.filter(key => !Object.keys(enums.SCHEMA_CHUNK_OPTIONS).includes(key))
            if (body.type.length === 0) {
                throw new HttpException('type不可为空', HttpStatus.BAD_REQUEST)
            } else if (cause.length > 0) {
                throw new HttpException('type参数错误', HttpStatus.BAD_REQUEST, { cause })
            }
            return await this.httpBaseChaxunSystemChunk(
                request,
                Object.assign(
                    { deplayName: this.deplayName },
                    body.type.reduce((ocs: Omix, key) => ({ ...ocs, [key]: true }), {})
                )
            )
        } catch (err) {
            return await this.fetchCatchCompiler(this.deplayName, err)
        }
    }
}
