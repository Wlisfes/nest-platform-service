import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common'
import { LoggerService, Logger } from '@/services/logger.service'
import { DatabaseService } from '@/services/database.service'
import { OmixHeaders } from '@/interface/instance.resolver'
import { faker, divineResolver, divineIntNumber, divineBstract, divineHandler } from '@/utils/utils-common'
import * as env from '@web-account-service/interface/instance.resolver'

@Injectable()
export class MemberService extends LoggerService {
    constructor(private readonly databaseService: DatabaseService) {
        super()
    }

    /**创建员工账号**/
    @Logger
    public async httpCreateMember(headers: OmixHeaders, body: env.BodyCreateMember) {
        const ctx = await this.databaseService.fetchConnectTransaction()
        try {
            // await this.databaseService.fetchConnectNotEmptyError(headers, this.databaseService.tbMember, {
            //     message: '工号已存在',
            //     dispatch: { where: body }
            // })
            // await this.databaseService.fetchConnectCreate(headers, this.databaseService.tbMember, {
            //     body: {
            //         staffId: await divineIntNumber(),
            //         password: Buffer.from('123456').toString('base64'),
            //         name: body.name,
            //         jobNumber: body.jobNumber
            //     }
            // })

            // console.log(faker.person.fullName(), Buffer.from('123456').toString('base64'))
            return body
        } catch (err) {
            await ctx.rollbackTransaction()
            return await this.fetchThrowException(err.message, err.status)
        } finally {
            await ctx.release()
        }
    }

    /**员工账号列表**/
    @Logger
    public async httpColumnMember(headers: OmixHeaders, body: env.BodyColumnMember) {
        console.log(body)
        return await this.databaseService.fetchConnectAndCount(headers, this.databaseService.tbMember, {})
    }
}
