import { Injectable } from '@nestjs/common'
import { Not } from 'typeorm'
import { Logger, AutoMethodDescriptor } from '@/modules/logger/logger.service'
import { DatabaseService } from '@/modules/database/database.service'
import { DeployEnumsService } from '@web-system-service/modules/deploy/deploy-enums.service'
import { OmixRequest } from '@/interface/instance.resolver'
import * as field from '@web-system-service/interface/instance.resolver'
import * as schema from '@/modules/database/database.schema'
import * as enums from '@/modules/database/database.enums'
import * as utils from '@/utils/utils-common'

@Injectable()
export class SystemChunkService extends Logger {
    constructor(private readonly database: DatabaseService, private readonly deployEnumsService: DeployEnumsService) {
        super()
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

    /**新增字典**/
    @AutoMethodDescriptor
    public async httpBaseSystemChunkCreate(request: OmixRequest, body: field.BaseSystemChunkCreate) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
            /**验证类型+value是否重复**/
            await this.database.fetchConnectNull(this.database.schemaChunk, {
                request,
                deplayName: this.deplayName,
                message: `value:${body.value} 已存在`,
                dispatch: { where: { value: body.value, type: body.type } }
            })
            /**验证pid父级是否不存在**/
            await utils.fetchHandler(utils.isNotEmpty(body.pid), async () => {
                return await this.database.fetchConnectNotNull(this.database.schemaChunk, {
                    request,
                    deplayName: this.deplayName,
                    message: `pid:${body.pid} 不存在`,
                    dispatch: { where: { keyId: body.pid } }
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
                await this.deployEnumsService.fetchBaseDeployRedisEnumsUpdate(request, {
                    type: body.type,
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
    public async httpBaseSystemColumnChunk(request: OmixRequest, body: field.BaseSystemColumnChunk) {
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
                            type: utils.fetchColumn(enums.STATIC_SCHEMA_CHUNK_OPTIONS, item.type),
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
    public async httpBaseSystemUpdateChunk(request: OmixRequest, body: field.BaseSystemUpdateChunk) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
            /**验证keyId是否不存在**/
            await this.fetchBaseCheckKeyIdSystemChunk(request, {
                keyId: body.keyId,
                deplayName: this.deplayName,
                message: `keyId:${body.keyId} 不存在`
            })
            /**验证类型+value是否重复**/
            await this.database.fetchConnectNull(this.database.schemaChunk, {
                request,
                deplayName: this.deplayName,
                message: `value:${body.value} 已存在`,
                dispatch: { where: { value: body.value, type: body.type, keyId: Not(body.keyId) } }
            })
            /**验证pid父级是否不存在**/
            await utils.fetchHandler(utils.isNotEmpty(body.pid), async () => {
                return await this.fetchBaseCheckKeyIdSystemChunk(request, {
                    keyId: body.pid,
                    deplayName: this.deplayName,
                    message: `pid:${body.pid} 不存在`
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
                await this.deployEnumsService.fetchBaseDeployRedisEnumsUpdate(request, {
                    type: body.type,
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
    public async httpBaseSystemSwitchChunk(request: OmixRequest, body: field.BaseSystemSwitchChunk) {
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
}
