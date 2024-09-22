import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common'
import { LoggerService, Logger } from '@/services/logger.service'
import { DatabaseService } from '@/services/database.service'
import { faker, divineResolver, divineIntNumber, divineBstract, divineHandler, divineDelay } from '@/utils/utils-common'
import { OmixHeaders } from '@/interface/instance.resolver'
import { tbDept, tbDeptMember } from '@/entities/instance'
import * as env from '@web-account-service/interface/instance.resolver'

@Injectable()
export class MemberService extends LoggerService {
    constructor(private readonly databaseService: DatabaseService) {
        super()
    }

    /**创建员工账号**/
    @Logger
    public async httpCreateMember(headers: OmixHeaders, staffId: string, body: env.BodyCreateMember) {
        const ctx = await this.databaseService.fetchConnectTransaction()
        try {
            await this.databaseService.fetchConnectNotEmptyError(headers, this.databaseService.tbMember, {
                message: '工号已存在',
                dispatch: { where: { jobNumber: body.jobNumber } }
            })
            await this.databaseService.fetchConnectEmptyError(headers, this.databaseService.tbDept, {
                message: '部门ID不存在',
                dispatch: { where: { deptId: body.deptId } }
            })
            const { staffId } = await this.databaseService.fetchConnectCreate(headers, this.databaseService.tbMember, {
                body: {
                    staffId: await divineIntNumber(),
                    password: Buffer.from('123456').toString('base64'),
                    name: body.name,
                    jobNumber: body.jobNumber
                }
            })
            await this.databaseService.fetchConnectCreate(headers, this.databaseService.tbDeptMember, {
                body: {
                    staffId,
                    deptId: body.deptId,
                    master: body.master
                }
            })
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
            qb.leftJoinAndMapOne('t.dept', tbDeptMember, 'dept', 't.staffId = dept.staffId')
            // qb.select(['t.keyId', 't.staffId', 't.name', 't.jobNumber', 't.avatar', 't.state', 'dept.deptId AS deptId'])
            return qb.getManyAndCount().then(async ([list = [], total = 0]) => {
                return await divineResolver({ list, total })
            })
        })
    }
}
