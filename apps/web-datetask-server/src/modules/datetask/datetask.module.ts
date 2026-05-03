import { Module } from '@nestjs/common'
import { BullModule } from '@nestjs/bullmq'
import { DatetaskManagerService } from '@web-datetask-server/modules/datetask/datetask.service'
import { DatetaskProcessor } from '@web-datetask-server/modules/datetask/datetask.processor'
import { DATETASK_QUEUE } from '@web-datetask-server/modules/datetask/datetask.constants'

@Module({
    imports: [
        BullModule.registerQueue({
            name: DATETASK_QUEUE,
            defaultJobOptions: {
                removeOnComplete: 100,
                removeOnFail: 200,
                attempts: 1
            }
        })
    ],
    providers: [DatetaskManagerService, DatetaskProcessor],
    exports: [DatetaskManagerService, DatetaskProcessor]
})
export class DatetaskManagerModule {}
