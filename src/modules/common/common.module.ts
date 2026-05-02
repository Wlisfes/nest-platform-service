import { Module, Global } from '@nestjs/common'
import { CodexService } from '@/modules/common/modules/codex.service'
import { WalletService } from '@/modules/common/modules/wallet.service'

@Global()
@Module({
    imports: [],
    providers: [CodexService, WalletService],
    exports: [CodexService, WalletService]
})
export class CommonModule {}
