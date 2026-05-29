import { Module, Global } from '@nestjs/common'
import { BullModule } from '@nestjs/bullmq'
import { SystemService } from '@web-datetask-server/modules/system/system.service'
import { SystemProcessor } from '@web-datetask-server/modules/system/system.processor'
import * as constants from '@web-datetask-server/modules/datetask/datetask.constants'

@Global()
@Module({
    imports: [
        BullModule.registerQueue({
            name: constants.DATETASK_SYSTEM_QUEUE,
            defaultJobOptions: { removeOnComplete: 100, removeOnFail: 200, attempts: 1 }
        })
    ],
    providers: [SystemService, SystemProcessor],
    exports: [SystemService, SystemProcessor]
})
export class SystemModule {}
