import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common'
import { UserAgentMiddleware, LoggerMiddleware } from '@/middleware'
import { ConfigModule } from '@/modules/config/config.module'
import { LoggerModule } from '@/modules/logger/logger.module'
import { DatabaseModule } from '@/modules/database/database.module'
import { RedisModule } from '@/modules/redis/redis.module'
import { AppController } from '@web-wallet-server/app.controller'

@Module({
    imports: [LoggerModule, ConfigModule, DatabaseModule, RedisModule],
    controllers: [AppController]
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(UserAgentMiddleware, LoggerMiddleware).forRoutes('*')
    }
}
