import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common'
import { APP_INTERCEPTOR, APP_FILTER, APP_GUARD } from '@nestjs/core'
import { ConfigModule } from '@/modules/config/config.module'
import { DatabaseModule } from '@/modules/database/database.module'

@Module({
    imports: [ConfigModule, DatabaseModule],
    providers: []
})
export class WebSystemModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        // consumer.apply(UserAgentMiddleware, LoggerMiddleware).forRoutes('*')
    }
}
