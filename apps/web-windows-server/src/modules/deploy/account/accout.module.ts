import { Module, Global } from '@nestjs/common'
import { DeployAccountService } from '@web-windows-server/modules/deploy/account/account.service'
import { DeployAccountUtilsService } from '@web-windows-server/modules/deploy/account/account.utils.service'
import { DeployAccountController } from '@web-windows-server/modules/deploy/account/account.controller'

@Global()
@Module({
    providers: [DeployAccountUtilsService, DeployAccountService],
    controllers: [DeployAccountController],
    exports: [DeployAccountUtilsService, DeployAccountService]
})
export class DeployAccoutModule {}
