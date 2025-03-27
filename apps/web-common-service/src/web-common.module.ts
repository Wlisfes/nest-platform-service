import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common'
import { APP_INTERCEPTOR, APP_FILTER, APP_GUARD } from '@nestjs/core'
import { UserAgentMiddleware } from '@/middleware/useragent.middleware'
import { LoggerMiddleware } from '@/middleware/logger.middleware'
import { AuthGuard } from '@/guard/auth.guard'
import { TransformInterceptor } from '@/interceptor/transform.interceptor'
import { HttpExceptionFilter } from '@/filters/http-exception.filter'
import { ConfigModule } from '@/modules/config/config.module'
import { LoggerModule } from '@/modules/logger/logger.module'
import { ThrottlerModule } from '@/modules/throttler/throttler.module'
import { CommonModule } from '@/modules/common/common.module'
import { JwtModule } from '@/modules/jwt/jwt.module'
import { DatabaseModule } from '@/modules/database/database.module'
import { RedisModule } from '@/modules/redis/redis.module'
import { CommonCodexController } from '@web-common-service/controllers/codex.controller'

@Module({
    imports: [
        LoggerModule.forRoot({ name: 'web-common-service' }),
        ConfigModule,
        ThrottlerModule,
        JwtModule,
        RedisModule,
        DatabaseModule,
        CommonModule
    ],
    providers: [
        { provide: APP_GUARD, useClass: AuthGuard },
        { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
        { provide: APP_FILTER, useClass: HttpExceptionFilter }
    ],
    controllers: [CommonCodexController]
})
export class WebCommonModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(UserAgentMiddleware, LoggerMiddleware).forRoutes('*')
    }
}
