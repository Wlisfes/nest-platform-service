import { Module } from '@nestjs/common'
import { SystemRouterController } from '@web-system-service/modules/system/system-router.controller'
import { SystemRouterService } from '@web-system-service/modules/system/system-router.service'

@Module({
    controllers: [SystemRouterController],
    providers: [SystemRouterService],
    exports: [SystemRouterService]
})
export class SystemModule {}
