import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common'
import { LoggerService, Logger } from '@/services/logger.service'
import { DatabaseService } from '@/services/database.service'
import { Omix, OmixHeaders } from '@/interface/instance.resolver'
import { tbMember, tbDept, tbDeptMember } from '@/entities/instance'
import { difference } from 'lodash'
import { faker, divineResolver, divineIntNumber, divineHandler } from '@/utils/utils-common'
import * as env from '@web-account-service/interface/instance.resolver'

@Injectable()
export class WhereService extends LoggerService {
    constructor(private readonly databaseService: DatabaseService) {
        super()
    }
}
