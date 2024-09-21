import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common'
import { LoggerService, Logger } from '@/services/logger.service'
import { DatabaseService } from '@/services/database.service'
import { OmixHeaders } from '@/interface/instance.resolver'
import { divineResolver, divineIntNumber, divineBstract, divineHandler } from '@/utils/utils-common'
import * as env from '@web-auth-service/interface/instance.resolver'

@Injectable()
export class MemberService extends LoggerService {
    constructor(private readonly databaseService: DatabaseService) {
        super()
    }

    /**创建员工账号**/
    @Logger
    public async httpCreateMember(headers: OmixHeaders, state: env.BodyCreateMember) {
        console.log(state)
        // return await divineResolver({ message: 'dasdsad' })
    }
}
