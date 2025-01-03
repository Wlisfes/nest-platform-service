import { Module } from '@nestjs/common'
import { SystemService } from '@web-system-service/modules/system/system.service'
import { SystemController } from '@web-system-service/modules/system/system.controller'

@Module({
    controllers: [SystemController],
    providers: [SystemService],
    exports: [SystemService]
})
export class SystemModule {}
