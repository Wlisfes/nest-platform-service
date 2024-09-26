import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common'
import { LoggerService, Logger } from '@/services/logger.service'
import { DatabaseService } from '@/services/database.service'
import { WhereMemberService } from '@/wheres/where-member.service'
import { WhereDeptService } from '@/wheres/where-dept.service'
import { WhereSimpleService } from '@/wheres/where-simple.service'
import { Omix, OmixHeaders } from '@/interface/instance.resolver'
import { tbMember, tbDept, tbDeptMember } from '@/entities/instance'
import { difference } from 'lodash'
import { faker, divineResolver, divineIntNumber, divineHandler } from '@/utils/utils-common'
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
        private readonly databaseService: DatabaseService,
        private readonly whereMemberService: WhereMemberService,
        private readonly whereDeptService: WhereDeptService,
        private readonly whereSimpleService: WhereSimpleService
    ) {
        super()
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

            // await this.databaseService.fetchConnectBuilder(headers, this.databaseService.tbSimple)
            // await this.databaseService.fetchConnectEmptyError(headers, this.databaseService.tbSimple, {
            //     message: '部门ID不存在',
            //     dispatch: { where: {} }
            // })
            // const { staffId } = await this.databaseService.fetchConnectCreate(headers, this.databaseService.tbMember, {
            //     body: {
            //         staffId: await divineIntNumber(),
            //         password: Buffer.from('123456').toString('base64'),
            //         name: body.name,
            //         jobNumber: body.jobNumber
            //     }
            // })
            // await this.databaseService.fetchConnectCreate(headers, this.databaseService.tbDeptMember, {
            //     body: {
            //         staffId
            //         // deptId: body.deptId
            //         // master: body.master
            //     }
            // })
            // return await divineResolver({ message: 'success' })

            // for (let index = 0; index < 10; index++) {
            //     await divineDelay(1)
            //     const { staffId } = await this.databaseService.fetchConnectCreate(headers, this.databaseService.tbMember, {
            //         body: {
            //             staffId: await divineIntNumber(),
            //             password: Buffer.from('123456').toString('base64'),
            //             name: faker.person.fullName(),
            //             jobNumber: body.jobNumber
            //         }
            //     })
            //     await this.databaseService.fetchConnectCreate(headers, this.databaseService.tbDeptMember, {
            //         body: {
            //             staffId,
            //             deptId: body.deptId
            //         }
            //     })
            // }
            return await divineResolver({ message: 'success' })
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
            qb.leftJoinAndMapOne('dept.name', tbDept, 'deptName', 'dept.deptId = deptName.deptId')
            return qb.getManyAndCount().then(async ([list = [], total = 0]) => {
                return await divineResolver({ total, list: list.map(fetchColumnFlatMember) })
            })
        })
    }
}
