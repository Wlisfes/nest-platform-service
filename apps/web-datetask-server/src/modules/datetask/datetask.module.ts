import { Module, Global } from '@nestjs/common'
import { BullModule } from '@nestjs/bullmq'
import { DatetaskService } from '@web-datetask-server/modules/datetask/datetask.service'
import { DatetaskQueueService } from '@web-datetask-server/modules/datetask/datetask.queue.service'
import { DatetaskUtilsService } from '@web-datetask-server/modules/datetask/datetask.utils.service'
import { DatetaskController } from '@web-datetask-server/modules/datetask/datetask.controller'
import { ExchangeModule } from '@web-datetask-server/modules/exchange/exchange.module'
import { FormosanModule } from '@web-datetask-server/modules/formosan/formosan.module'
import { SystemModule } from '@web-datetask-server/modules/system/system.module'
import * as constants from '@web-datetask-server/modules/datetask/datetask.constants'

@Global()
@Module({
    imports: [
        BullModule.registerQueue({
            name: constants.DATETASK_SYSTEM_QUEUE,
            defaultJobOptions: { removeOnComplete: 100, removeOnFail: 200, attempts: 1 }
        }),
        ExchangeModule,
        FormosanModule,
        SystemModule
    ],
    controllers: [DatetaskController],
    providers: [DatetaskQueueService, DatetaskUtilsService, DatetaskService],
    exports: [BullModule, ExchangeModule, FormosanModule, SystemModule, DatetaskQueueService, DatetaskUtilsService, DatetaskService]
})
export class DatetaskModule {}
