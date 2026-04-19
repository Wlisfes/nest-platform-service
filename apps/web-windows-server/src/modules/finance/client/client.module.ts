import { Module, Global } from '@nestjs/common'
import { FinanceClientService } from '@web-windows-server/modules/finance/client/client.service'
import { FinanceClientController } from '@web-windows-server/modules/finance/client/client.controller'

@Global()
@Module({
    providers: [FinanceClientService],
    controllers: [FinanceClientController],
    exports: [FinanceClientService]
})
export class FinanceClientModule {}
