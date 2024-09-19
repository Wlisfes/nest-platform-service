import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common'
import { APP_INTERCEPTOR, APP_FILTER, APP_GUARD } from '@nestjs/core'
import { LoggerMiddleware } from '@/middleware/logger.middleware'
import { UserAgentMiddleware } from '@/middleware/useragent.middleware'
import { AuthGuard } from '@/guard/auth.guard'
import { TransformInterceptor } from '@/interceptor/transform.interceptor'
import { HttpExceptionFilter } from '@/filter/http-exception.filter'
import { ConfigerModule } from '@/modules/configer.module'
import { LoggerModule } from '@/modules/logger.module'
import { ThrottlerModule } from '@/modules/throttler.module'
import { DatabaseModule } from '@/modules/database.module'

@Module({
    imports: [LoggerModule.forRoot({ name: 'web-auth-service' }), ConfigerModule, ThrottlerModule, DatabaseModule],
    controllers: [],
    providers: [
        { provide: APP_GUARD, useClass: AuthGuard },
        { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
        { provide: APP_FILTER, useClass: HttpExceptionFilter }
    ]
})
export class WebAuthModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(UserAgentMiddleware, LoggerMiddleware).forRoutes('*')
    }
}
