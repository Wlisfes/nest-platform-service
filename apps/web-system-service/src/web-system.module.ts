import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common'
import { APP_INTERCEPTOR, APP_FILTER, APP_GUARD } from '@nestjs/core'
import { UserAgentMiddleware } from '@/middleware/useragent.middleware'
import { LoggerMiddleware } from '@/middleware/logger.middleware'
import { TransformInterceptor } from '@/interceptor/transform.interceptor'

import { ConfigModule } from '@/modules/config/config.module'
import { LoggerModule } from '@/modules/logger/logger.module'
import { DatabaseModule } from '@/modules/database/database.module'

import { UserController } from '@web-system-service/modules/user/user.controller'

@Module({
    imports: [LoggerModule.forRoot({ name: 'web-account-service' }), ConfigModule, DatabaseModule],
    providers: [{ provide: APP_INTERCEPTOR, useClass: TransformInterceptor }],
    controllers: [UserController]
})
export class WebSystemModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(UserAgentMiddleware, LoggerMiddleware).forRoutes('*')
    }
}
