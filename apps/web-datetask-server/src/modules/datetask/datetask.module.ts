import { Module, Global } from '@nestjs/common'
import { DatetaskService } from '@web-datetask-server/modules/datetask/datetask.service'
import { DatetaskQueueService } from '@web-datetask-server/modules/datetask/datetask.queue.service'
import { DatetaskUtilsService } from '@web-datetask-server/modules/datetask/datetask.utils.service'
import { DatetaskController } from '@web-datetask-server/modules/datetask/datetask.controller'

@Global()
@Module({
    controllers: [DatetaskController],
    providers: [DatetaskQueueService, DatetaskUtilsService, DatetaskService],
    exports: [DatetaskQueueService, DatetaskUtilsService, DatetaskService]
})
export class DatetaskModule {}
