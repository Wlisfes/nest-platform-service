import { Injectable } from '@nestjs/common'
import { LoggerService, Logger } from '@/services/logger.service'
import { DatabaseService } from '@/services/database.service'
import { JwtService } from '@/services/jwt.service'
import { WhereMemberService } from '@/wheres/where-member.service'
import { WhereDeptService } from '@/wheres/where-dept.service'
import { WhereSimpleService } from '@/wheres/where-simple.service'
import { Omix, OmixHeaders } from '@/interface/instance.resolver'
import { tbMember, tbDept, tbDeptMember, tbDeptMaster, tbSimple, tbSimplePostMember, tbSimpleRankMember } from '@/entities/instance'
import { divineResolver, divineIntNumber, divineHandler } from '@/utils/utils-common'
import { compareSync } from 'bcryptjs'
import * as env from '@web-account-service/interface/instance.resolver'
import * as enums from '@/enums/instance'

/**列表字段扁平化**/
export function fetchColumnFlatMember(data: Omix<tbMember>) {
    return {
        ...data,
        dept: data.dept.map(item => ({ deptId: item.deptId, deptName: item.name.deptName }))
    }
}

@Injectable()
export class MemberService extends LoggerService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly databaseService: DatabaseService,
        private readonly whereMemberService: WhereMemberService,
        private readonly whereDeptService: WhereDeptService,
        private readonly whereSimpleService: WhereSimpleService
    ) {
        super()
    }

    /**员工账号登录**/
    @Logger
    public async httpAuthMember(headers: OmixHeaders, body: env.BodyAuthMember) {
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
                this.jwtService.fetchJwtTokenSecret
                console.log(node)
            })
        })
    }

    /**创建员工账号**/
    @Logger
    public async httpCreateMember(headers: OmixHeaders, staffId: string, body: env.BodyCreateMember) {
        const ctx = await this.databaseService.fetchConnectTransaction()
        try {
            /**验证员工工号是否已存在**/
            await this.whereMemberService.fetchMemberNullValidator(headers, {
                where: { jobNumber: body.jobNumber }
            })
            /**验证部门列表ID是否不存在**/
            await this.whereDeptService.fetchDeptDiffColumnValidator(headers, {
                dept: body.dept,
                fieldName: 'dept'
            })
            /**验证部门子管理员ID列表是否不存在**/
            await divineHandler((body.master ?? []).length > 0, {
                handler: async () => {
                    return await this.whereDeptService.fetchDeptDiffColumnValidator(headers, {
                        dept: body.master,
                        fieldName: 'master'
                    })
                }
            })
            /**验证职位ID列表是否不存在**/
            await this.whereSimpleService.fetchSimpleDiffColumnValidator(headers, {
                sid: body.post,
                stalk: enums.SimpleStalk.post
            })
            /**验证职级ID列表是否不存在**/
            await this.whereSimpleService.fetchSimpleDiffColumnValidator(headers, {
                sid: body.rank,
                stalk: enums.SimpleStalk.rank
            })
            /**写入员工表**/ //prettier-ignore
            return await this.databaseService.fetchConnectCreate(headers, this.databaseService.tbMember, {
                body: {
                    staffId: await divineIntNumber(),
                    password: Buffer.from('123456').toString('base64'),
                    name: body.name,
                    jobNumber: body.jobNumber
                }
            }).then(async ({ staffId }) => {
                /**员工与部门绑定关联**/
                await this.databaseService.fetchConnectInsert(headers, this.databaseService.tbDeptMember, {
                    body: body.dept.map(deptId => ({ deptId, staffId }))
                })
                /**员工与子管理员绑定关联**/
                await this.databaseService.fetchConnectInsert(headers, this.databaseService.tbDeptMaster, {
                    body: body.master.map(deptId => ({ deptId, staffId }))
                })
                /**员工与职位绑定关联***/
                await this.databaseService.fetchConnectInsert(headers, this.databaseService.tbSimplePostMember, {
                    body: body.post.map(sid => ({ sid, staffId }))
                })
                /**员工与职级绑定关联***/
                await this.databaseService.fetchConnectInsert(headers, this.databaseService.tbSimpleRankMember, {
                    body: body.rank.map(sid => ({ sid, staffId }))
                })
                return await divineResolver({ message: 'success' })
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
            qb.leftJoinAndMapMany('t.master', tbDeptMaster, 'master', 't.staffId = master.staffId')
            qb.leftJoinAndMapOne('master.name', tbDept, 'master1', 'master.deptId = master1.deptId')
            qb.leftJoinAndMapMany('t.post', tbSimplePostMember, 'post', 't.staffId = post.staffId')
            qb.leftJoinAndMapOne('post.name', tbSimple, 'post1', 'post.sid = post1.sid')
            qb.leftJoinAndMapMany('t.rank', tbSimpleRankMember, 'rank', 't.staffId = rank.staffId')
            qb.leftJoinAndMapOne('rank.name', tbSimple, 'rank1', 'rank.sid = rank1.sid')
            return qb.getManyAndCount().then(async ([list = [], total = 0]) => {
                return await divineResolver({
                    total,
                    list: list.map((data: Omix) => ({
                        ...data,
                        dept: data.dept.map(({ deptId, name }) => ({ deptId, deptName: name.deptName })),
                        master: data.master.map(({ deptId, name }) => ({ deptId, deptName: name.deptName })),
                        post: data.post.map(({ sid, name }) => ({ sid, name: name.name })),
                        rank: data.rank.map(({ sid, name }) => ({ sid, name: name.name }))
                    }))
                })
            })
        })
    }
}
