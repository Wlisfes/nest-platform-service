import { Module, Global } from '@nestjs/common'
import { CodexService } from '@/modules/system/codex.service'

@Global()
@Module({
    providers: [CodexService],
    exports: [CodexService]
})
export class SystemModule {}
