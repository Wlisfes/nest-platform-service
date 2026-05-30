import { Injectable } from '@nestjs/common'
import { Logger } from '@/modules/logger/logger.service'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'
import * as constants from './datetask.constants'

@Injectable()
export class DatetaskQueueService extends Logger {
    constructor(
        @InjectQueue(constants.DATETASK_SYSTEM_QUEUE) public readonly systemQueue: Queue,
        @InjectQueue(constants.DATETASK_FORMOSAN_QUEUE) public readonly formosanQueue: Queue
    ) {
        super()
    }
}
