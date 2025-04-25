import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { compareSync } from 'bcryptjs'
import { Logger, AutoMethodDescriptor } from '@/modules/logger/logger.service'
import { RedisService } from '@/modules/redis/redis.service'
import { JwtService } from '@/modules/jwt/jwt.service'
import { DatabaseService } from '@/modules/database/database.service'
import { DeployEnumsService } from '@web-system-service/modules/deploy/deploy-enums.service'
import { DeployCodexService } from '@web-system-service/modules/deploy/deploy-codex.service'
import { OmixRequest } from '@/interface/instance.resolver'
import * as field from '@web-system-service/interface/instance.resolver'
import * as schema from '@/modules/database/database.schema'
import * as enums from '@/modules/database/database.enums'
import * as utils from '@/utils/utils-common'

@Injectable()
export class SystemUserService extends Logger {
    constructor(
        private readonly httpService: HttpService,
        private readonly jwtService: JwtService,
        private readonly redisService: RedisService,
        private readonly database: DatabaseService,
        private readonly deployEnumsService: DeployEnumsService,
        private readonly deployCodexService: DeployCodexService
    ) {
        super()
    }

    /**刷新redis用户账号缓存**/
    @AutoMethodDescriptor
    public async fetchRedisUpdateSystemUser(request: OmixRequest, uid: string) {
        return await this.database.fetchConnectBuilder(this.database.schemaUser, async qb => {
            qb.where(`t.uid = :uid`, { uid })
            return await qb.getOne().then(async node => {
                // await this.redisService.setStore(request, {
                //     deplayName: this.deplayName,
                //     data: node.status,
                //     key: await this.redisService.fetchCompose(keys.COMMON_SYSTEM_USER_STATUS, { uid })
                // })
                return node
            })
        })
    }

    /**新增用户账号**/
    @AutoMethodDescriptor
    public async httpBaseSystemUserCreate(request: OmixRequest, body: field.BaseSystemUserCreate) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
            await this.database.fetchConnectBuilder(this.database.schemaUser, async qb => {
                qb.where(`t.number = :number OR t.phone = :phone`, { number: body.number, phone: body.phone })
                return await qb.getOne().then(async node => {
                    if (utils.isNotEmpty(node) && node.number == body.number) {
                        throw new HttpException(`number:${body.name} 已存在`, HttpStatus.BAD_REQUEST)
                    } else if (utils.isNotEmpty(node) && node.phone == body.phone) {
                        throw new HttpException(`phone:${body.name} 已存在`, HttpStatus.BAD_REQUEST)
                    }
                    return node
                })
            })
            await this.database.fetchConnectCreate(ctx.manager.getRepository(schema.SchemaUser), {
                deplayName: this.deplayName,
                request,
                body: Object.assign(body, { uid: await utils.fetchIntNumber() })
            })
            return await ctx.commitTransaction().then(async () => {
                return await this.fetchResolver({ message: '新增成功' })
            })
        } catch (err) {
            await ctx.rollbackTransaction()
            return await this.fetchCatchCompiler(this.deplayName, err)
        } finally {
            await ctx.release()
        }
    }

    /**用户账号登录**/
    @AutoMethodDescriptor
    public async httpBaseSystemUserTokenAuthorize(request: OmixRequest, body: field.BaseSystemUserTokenAuthorize) {
        try {
            await this.deployCodexService.httpDeployCodexTokenCheckReader(request, body)
            return await this.database.fetchConnectBuilder(this.database.schemaUser, async qb => {
                qb.addSelect('t.password')
                qb.where(`t.number = :number OR t.phone = :number OR t.email = :number`, { number: body.number })
                return await qb.getOne().then(async node => {
                    if (utils.isEmpty(node)) {
                        throw new HttpException(`账号不存在`, HttpStatus.BAD_REQUEST)
                    } else if (!compareSync(body.password, node.password)) {
                        throw new HttpException(`账号密码不正确`, HttpStatus.BAD_REQUEST)
                    } else if (['disable'].includes(node.status)) {
                        throw new HttpException(`账号已被禁用`, HttpStatus.FORBIDDEN)
                    }
                    return await this.jwtService.fetchJwtTokenSecret(utils.pick(node, ['uid', 'number', 'name', 'status']))
                })
            })
        } catch (err) {
            return await this.fetchCatchCompiler(this.deplayName, err)
        }
    }

    /**用户账号列表**/
    @AutoMethodDescriptor
    public async httpBaseSystemColumnUser(request: OmixRequest, body: field.BaseSystemColumnUser) {
        try {
            return await this.database.fetchConnectBuilder(this.database.schemaUser, async qb => {
                await this.database.fetchSelection(qb, [
                    ['t', ['id', 'uid', 'name', 'number', 'phone', 'email', 'avatar', 'status', 'createTime', 'modifyTime']]
                ])
                await this.database.fetchBrackets(utils.isNotEmpty(body.vague), function () {
                    return qb.where(`t.number LIKE :vague OR t.phone LIKE :vague OR t.email LIKE :vague OR t.name LIKE :vague`, {
                        vague: `%${body.vague}%`
                    })
                })
                await this.database.fetchBrackets(utils.isNotEmpty(body.number), () => {
                    return qb.andWhere('t.number = :number', { number: body.number })
                })
                await this.database.fetchBrackets(utils.isNotEmpty(body.phone), () => {
                    return qb.andWhere('t.phone = :phone', { phone: body.phone })
                })
                await this.database.fetchBrackets(utils.isNotEmpty(body.email), () => {
                    return qb.andWhere('t.email = :email', { email: body.email })
                })
                await this.database.fetchBrackets(utils.isNotEmpty(body.name), () => {
                    return qb.andWhere('t.name = :name', { name: body.name })
                })
                await this.database.fetchBrackets(utils.isNotEmpty(body.status), () => {
                    return qb.andWhere('t.status = :status', { status: body.status })
                })
                await this.database.fetchBrackets(utils.isNotEmpty(body.startTime) && utils.isNotEmpty(body.endTime)).then(async where => {
                    if (where) {
                        return qb.andWhere('t.createTime >= :startTime AND t.createTime <= :endTime', {
                            startTime: body.startTime,
                            endTime: body.endTime
                        })
                    } else if (utils.isNotEmpty(body.startTime)) {
                        qb.andWhere('t.createTime >= :startTime', { startTime: body.startTime })
                    } else if (utils.isNotEmpty(body.endTime)) {
                        qb.andWhere('t.createTime <= :endTime', { endTime: body.endTime })
                    }
                })
                await qb.orderBy({ 't.id': 'DESC' })
                await qb.offset((body.page - 1) * body.size)
                await qb.limit(body.size)
                return await qb.getManyAndCount().then(async ([list = [], total = 0]) => {
                    return await this.fetchResolver({
                        message: '操作成功',
                        total,
                        list: utils.fetchConcat(list, item => ({ statusChunk: enums.COMMON_SYSTEM_ROUTER_STATUS[item.status] }))
                    })
                })
            })
        } catch (err) {
            return await this.fetchCatchCompiler(this.deplayName, err)
        }
    }

    /**编辑账号状态**/
    public async httpBaseSystemSwitchUser(request: OmixRequest, body: field.BaseSystemSwitchUser) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
            await this.database.fetchConnectNotNull(this.database.schemaUser, {
                deplayName: this.deplayName,
                request,
                message: `uid:${body.uid} 不存在`,
                dispatch: { where: { uid: body.uid } }
            })
            await this.database.fetchConnectUpdate(ctx.manager.getRepository(schema.SchemaUser), {
                deplayName: this.deplayName,
                request,
                where: { uid: body.uid },
                body: { status: body.status }
            })
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

    /**获取账号基本信息**/
    @AutoMethodDescriptor
    public async httpBaseSystemUserResolver(request: OmixRequest) {
        try {
            return await this.database.fetchConnectNotNull(this.database.schemaUser, {
                request,
                deplayName: this.deplayName,
                message: `uid:${request.user.uid} 不存在`,
                dispatch: { where: { uid: request.user.uid } }
            })
        } catch (err) {
            return await this.fetchCatchCompiler(this.deplayName, err)
        }
    }
}
