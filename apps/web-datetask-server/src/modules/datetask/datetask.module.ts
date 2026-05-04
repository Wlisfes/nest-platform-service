import { Module, Global } from '@nestjs/common'
import { BullModule } from '@nestjs/bullmq'
import { DatetaskService } from '@web-datetask-server/modules/datetask/datetask.service'
import { DatetaskSystemProcessor } from '@web-datetask-server/modules/datetask/datetask-system.processor'
import * as constants from '@web-datetask-server/modules/datetask/datetask.constants'

@Global()
@Module({
    imports: [
        BullModule.registerQueue({
            name: constants.DATETASK_SYSTEM_QUEUE,
            defaultJobOptions: {
                removeOnComplete: 100,
                removeOnFail: 200,
                attempts: 1
            }
        }),
        BullModule.registerQueue({
            name: constants.DATETASK_SMS_QUEUE,
            defaultJobOptions: {
                removeOnComplete: 100,
                removeOnFail: 200,
                attempts: 1
            }
        })
    ],
    providers: [DatetaskService, DatetaskSystemProcessor],
    exports: [DatetaskService, DatetaskSystemProcessor]
})
export class DatetaskModule {}
