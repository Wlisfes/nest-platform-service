import { Module, Global } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerModule as NestThrottlerModule } from '@nestjs/throttler'
import { AuthGuardThrottler } from '@/guard/auth.throttler.guard'
import * as thr from '@/config/web-throttle'

@Global()
@Module({
    imports: [NestThrottlerModule.forRoot([thr.WEB_THROTTLE.default, thr.WEB_THROTTLE.small, thr.WEB_THROTTLE.large])],
    providers: [{ provide: APP_GUARD, useClass: AuthGuardThrottler }],
    controllers: [],
    exports: []
})
export class ThrottlerModule {}
