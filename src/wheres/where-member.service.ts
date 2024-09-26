import { Injectable } from '@nestjs/common'
import { Repository } from 'typeorm'
import { LoggerService } from '@/services/logger.service'
import { DatabaseService } from '@/services/database.service'
import { OmixHeaders } from '@/interface/instance.resolver'
import { tbMember } from '@/entities/instance'

@Injectable()
export class WhereMemberService extends LoggerService {
    constructor(private readonly databaseService: DatabaseService) {
        super()
    }

    /**验证员工工号是否已存在**/
    public async fetchMemberNullValidator(headers: OmixHeaders, dispatch: Parameters<Repository<tbMember>['findOne']>['0']) {
        return await this.databaseService.fetchConnectNotEmptyError(headers, this.databaseService.tbMember, {
            message: '工号已存在',
            dispatch: dispatch
        })
    }
}
