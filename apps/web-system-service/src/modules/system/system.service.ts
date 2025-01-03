import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Logger } from '@/modules/logger/logger.service'
import { DatabaseService } from '@/modules/database/database.service'

@Injectable()
export class SystemService extends Logger {
    constructor(private readonly database: DatabaseService) {
        super()
    }
}
