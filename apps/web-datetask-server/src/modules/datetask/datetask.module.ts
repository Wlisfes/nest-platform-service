import { Module, Global } from '@nestjs/common'
import { BullModule } from '@nestjs/bullmq'
import { DatetaskService } from '@web-datetask-server/modules/datetask/datetask.service'
import { DatetaskProcessor } from '@web-datetask-server/modules/datetask/datetask.processor'
import { DATETASK_QUEUE } from '@web-datetask-server/modules/datetask/datetask.constants'

@Global()
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
    providers: [DatetaskService, DatetaskProcessor],
    exports: [DatetaskService, DatetaskProcessor]
})
export class DatetaskModule {}
