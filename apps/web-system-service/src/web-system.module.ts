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
import { SystemModule } from '@/modules/system/system.module'
import { JwtModule } from '@/modules/jwt/jwt.module'
import { DatabaseModule } from '@/modules/database/database.module'
import { RedisModule } from '@/modules/redis/redis.module'
//service
import { UserService } from '@web-system-service/modules/user/user.service'
//controller
import { UserController } from '@web-system-service/modules/user/user.controller'

@Module({
    imports: [
        LoggerModule.forRoot({ name: 'web-account-service' }),
        ConfigModule,
        ThrottlerModule,
        SystemModule,
        JwtModule,
        RedisModule,
        DatabaseModule
    ],
    providers: [
        { provide: APP_GUARD, useClass: AuthGuard },
        { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
        { provide: APP_FILTER, useClass: HttpExceptionFilter },
        UserService
    ],
    controllers: [UserController]
})
export class WebSystemModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(UserAgentMiddleware, LoggerMiddleware).forRoutes('*')
    }
}
