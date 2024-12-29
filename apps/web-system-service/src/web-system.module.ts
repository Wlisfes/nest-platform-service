import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common'
import { APP_INTERCEPTOR, APP_FILTER, APP_GUARD } from '@nestjs/core'

@Module({
    imports: [],
    providers: []
})
export class WebSystemModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        // consumer.apply(UserAgentMiddleware, LoggerMiddleware).forRoutes('*')
    }
}
