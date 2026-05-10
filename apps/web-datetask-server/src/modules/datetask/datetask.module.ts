import { Module, Global } from '@nestjs/common'
import { BullModule } from '@nestjs/bullmq'
import { DatetaskService } from '@web-datetask-server/modules/datetask/datetask.service'
import { DatetaskController } from '@web-datetask-server/modules/datetask/datetask.controller'
import { DatetaskSystemProcessor } from '@web-datetask-server/modules/datetask/datetask-system.processor'
import { DatetaskSystemService } from '@web-datetask-server/modules/datetask/datetask-system.service'
import * as constants from '@web-datetask-server/modules/datetask/datetask.constants'

@Global()
@Module({
    imports: [
        BullModule.registerQueue({
            name: constants.DATETASK_SYSTEM_QUEUE,
            defaultJobOptions: { removeOnComplete: 100, removeOnFail: 200, attempts: 1 }
        }),
        BullModule.registerQueue({
            name: constants.DATETASK_SMS_OTP_QUEUE,
            defaultJobOptions: { removeOnComplete: 100, removeOnFail: 200, attempts: 1 }
        }),
        BullModule.registerQueue({
            name: constants.DATETASK_SMS_COMMON_QUEUE,
            defaultJobOptions: { removeOnComplete: 100, removeOnFail: 200, attempts: 1 }
        })
    ],
    controllers: [DatetaskController],
    providers: [DatetaskService, DatetaskSystemService, DatetaskSystemProcessor],
    exports: [DatetaskService, DatetaskSystemService, DatetaskSystemProcessor]
})
export class DatetaskModule {}
