import { Module } from '@nestjs/common'
import { SystemService } from '@web-datetask-server/modules/system/system.service'
import { SystemProcessor } from '@web-datetask-server/modules/system/system.processor'
import { SystemController } from '@web-datetask-server/modules/system/system.controller'

@Module({
    controllers: [SystemController],
    providers: [SystemService, SystemProcessor],
    exports: [SystemService, SystemProcessor]
})
export class SystemModule {}
