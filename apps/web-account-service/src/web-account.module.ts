import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common'
import { APP_INTERCEPTOR, APP_FILTER, APP_GUARD } from '@nestjs/core'
import { LoggerMiddleware } from '@/middleware/logger.middleware'
import { UserAgentMiddleware } from '@/middleware/useragent.middleware'
import { AuthGuard } from '@/guard/auth.guard'
import { TransformInterceptor } from '@/interceptor/transform.interceptor'
import { HttpExceptionFilter } from '@/filter/http-exception.filter'
//modules
import { ConfigerModule } from '@/modules/configer.module'
import { LoggerModule } from '@/modules/logger.module'
import { ThrottlerModule } from '@/modules/throttler.module'
import { RedisModule } from '@/modules/redis.module'
import { DatabaseModule } from '@/modules/database.module'
import { UploadModule } from '@/modules/upload.module'
//services
import { MemberService } from '@web-account-service/services/member.service'
//controllers
import { UserController } from '@web-account-service/controllers/user.controller'
import { MemberController } from '@web-account-service/controllers/member.controller'

@Module({
    imports: [
        LoggerModule.forRoot({ name: 'web-account-service' }),
        ConfigerModule,
        ThrottlerModule,
        RedisModule,
        DatabaseModule,
        UploadModule
    ],
    controllers: [UserController, MemberController],
    providers: [
        { provide: APP_GUARD, useClass: AuthGuard },
        { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
        { provide: APP_FILTER, useClass: HttpExceptionFilter },
        MemberService
    ]
})
export class WebAccountModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(UserAgentMiddleware, LoggerMiddleware).forRoutes('*')
    }
}
