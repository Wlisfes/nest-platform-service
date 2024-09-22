import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common'
import { LoggerService, Logger } from '@/services/logger.service'
import { DatabaseService } from '@/services/database.service'
import { OmixHeaders } from '@/interface/instance.resolver'
import { divineResolver, divineIntNumber, divineBstract, divineHandler } from '@/utils/utils-common'
import * as env from '@web-account-service/interface/instance.resolver'

@Injectable()
export class MemberService extends LoggerService {
    constructor(private readonly databaseService: DatabaseService) {
        super()
    }

    /**创建员工账号**/
    @Logger
    public async httpCreateMember(headers: OmixHeaders, state: env.BodyCreateMember) {
        const ctx = await this.databaseService.fetchConnectTransaction()
        try {
            const node = await this.databaseService.fetchConnectNotEmptyError(headers, this.databaseService.tbMember, {
                message: '工号已存在',
                dispatch: { where: state },
                transform: data => {
                    return false
                }
            })
        } catch (err) {
            await ctx.rollbackTransaction()
            return await this.fetchThrowException(err.message, err.status)
        } finally {
            await ctx.release()
        }
    }
}
