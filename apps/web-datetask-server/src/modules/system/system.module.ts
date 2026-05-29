import { Module } from '@nestjs/common'
import { SystemService } from '@web-datetask-server/modules/system/system.service'
import { SystemProcessor } from '@web-datetask-server/modules/system/system.processor'

@Module({
    providers: [SystemService, SystemProcessor],
    exports: [SystemService, SystemProcessor]
})
export class SystemModule {}
