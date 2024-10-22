import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { JwtService } from '@/services/jwt.service'
import { LoggerService, Logger } from '@/services/logger.service'
import { RedisService } from '@/services/redis/redis.service'
import { DatabaseService } from '@/services/database.service'
import { Omix, OmixHeaders, OmixRequest } from '@/interface/instance.resolver'
import { tbDept, tbDeptMember, tbSimple, tbSimplePostMember, tbSimpleRankMember } from '@/entities/instance'
import { fetchResolver, fetchIntNumber, fetchKeyCompose } from '@/utils/utils-common'
import { divineGraphCodex } from '@/utils/utils-plugin'
import { compareSync } from 'bcryptjs'
import { Response } from 'express'
import { isEmpty } from 'class-validator'
import * as _ from 'lodash'
import * as enums from '@/enums/instance'
import * as web from '@/config/web-instance'
import * as keys from '@web-account-service/keys'
import * as env from '@web-account-service/interface/instance.resolver'

@Injectable()
export class MemberService extends LoggerService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly redisService: RedisService,
        private readonly databaseService: DatabaseService
    ) {
        super()
    }

    /**登录图形验证码**/
    @Logger
    public async httpAuthGraphCodex(headers: OmixHeaders, response: Response) {
        const { text, data, sid } = await divineGraphCodex({ width: 120, height: 40 })
        const key = await fetchKeyCompose(keys.NEST_ACCOUNT_LOGIN, sid)
        return await this.redisService.setStore(headers, { key, data: text, seconds: 5 * 60 }).then(async () => {
            this.logger.info({ message: '图形验证码发送成功', seconds: 5 * 60, key, text })
            await response.cookie(web.WEB_COMMON_HEADER_CAPHCHA, sid, { httpOnly: true })
            await response.type('svg')
            return await response.send(data)
        })
    }

    /**员工账号登录**/
    @Logger
    public async httpAuthMember(headers: OmixHeaders, request: OmixRequest, body: env.BodyAuthMember) {
        /**校验图形验证码**/
        const sid = request.cookies[web.WEB_COMMON_HEADER_CAPHCHA]
        if (!sid) {
            throw new HttpException(`验证码不存在`, HttpStatus.BAD_REQUEST)
        } else {
            const key = await fetchKeyCompose(keys.NEST_ACCOUNT_LOGIN, sid)
            await this.redisService.getStore<string>(headers, { key, defaultValue: null }).then(async code => {
                if (isEmpty(code) || body.code.toUpperCase() !== code.toUpperCase()) {
                    throw new HttpException(`验证码错误或已过期`, HttpStatus.BAD_REQUEST)
                }
                return await this.redisService.delStore(headers, { key })
            })
        }
        return await this.databaseService.fetchConnectBuilder(headers, this.databaseService.tbMember, async qb => {
            qb.addSelect('t.password')
            qb.where('t.jobNumber = :jobNumber', { jobNumber: body.jobNumber })
            return await qb.getOne().then(async node => {
                await this.databaseService.fetchConnectCatchWherer(!Boolean(node), node, {
                    message: '员工账号不存在'
                })
                await this.databaseService.fetchConnectCatchWherer(!compareSync(body.password, node.password), node, {
                    message: '员工账号密码错误'
                })
                await this.databaseService.fetchConnectCatchWherer(node.state !== enums.MemberState.online, node, {
                    message: '员工已离职或账号已被禁用'
                })
                return await this.jwtService.fetchJwtTokenSecret(_.pick(node, ['id', 'name', 'jobNumber', 'state', 'password']))
            })
        })
    }

    /**创建员工账号**/
    @Logger
    public async httpCreateMember(headers: OmixHeaders, staffId: string, body: env.BodyCreateMember) {
        const ctx = await this.databaseService.fetchConnectTransaction()
        try {
            await this.databaseService.fetchConnectNotEmptyError(headers, this.databaseService.tbMember, {
                message: '工号已存在',
                dispatch: {
                    where: { jobNumber: body.jobNumber }
                }
            })
            await this.databaseService.fetchConnectCreate(headers, this.databaseService.tbMember, {
                body: {
                    id: fetchIntNumber(),
                    password: Buffer.from('123456').toString('base64'),
                    name: body.name,
                    jobNumber: body.jobNumber
                }
            })
            return await ctx.commitTransaction().then(async () => {
                return await fetchResolver({ message: '操作成功' })
            })
        } catch (err) {
            await ctx.rollbackTransaction()
            return await this.fetchThrowException(err.message, err.status)
        } finally {
            await ctx.release()
        }
    }

    /**员工账号列表**/
    @Logger
    public async httpColumnMember(headers: OmixHeaders, staffId: string, body: env.BodyColumnMember) {
        return await this.databaseService.fetchConnectBuilder(headers, this.databaseService.tbMember, async qb => {
            qb.leftJoinAndMapMany('t.dept', tbDeptMember, 'dept', 't.staffId = dept.staffId')
            qb.leftJoinAndMapOne('dept.name', tbDept, 'dept1', 'dept.deptId = dept1.deptId')
            qb.leftJoinAndMapOne('master.name', tbDept, 'master1', 'master.deptId = master1.deptId')
            qb.leftJoinAndMapMany('t.post', tbSimplePostMember, 'post', 't.staffId = post.staffId')
            qb.leftJoinAndMapOne('post.name', tbSimple, 'post1', 'post.sid = post1.sid')
            qb.leftJoinAndMapMany('t.rank', tbSimpleRankMember, 'rank', 't.staffId = rank.staffId')
            qb.leftJoinAndMapOne('rank.name', tbSimple, 'rank1', 'rank.sid = rank1.sid')
            return qb.getManyAndCount().then(async ([list = [], total = 0]) => {
                return await fetchResolver({
                    total,
                    list: list.map((data: Omix) => ({
                        ...data,
                        dept: data.dept.map(({ deptId, name }) => ({ deptId, deptName: name.deptName })),
                        post: data.post.map(({ sid, name }) => ({ sid, name: name.name })),
                        rank: data.rank.map(({ sid, name }) => ({ sid, name: name.name }))
                    }))
                })
            })
        })
    }
}
