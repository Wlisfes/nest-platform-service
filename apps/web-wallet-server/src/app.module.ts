import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common'
import { UserAgentMiddleware, LoggerMiddleware } from '@/middleware'
import { ConfigModule } from '@/modules/config/config.module'
import { LoggerModule } from '@/modules/logger/logger.module'
import { DatabaseModule } from '@/modules/database/database.module'
import { RedisModule } from '@/modules/redis/redis.module'
import { CommonModule } from '@/modules/common/common.module'
import { RabbitmqModule } from '@/modules/rabbitmq/rabbitmq.module'
import { AppController } from '@web-wallet-server/app.controller'
import { AppWalletService } from '@web-wallet-server/app-wallet.service'

@Module({
    imports: [LoggerModule, ConfigModule, DatabaseModule, RedisModule, CommonModule, RabbitmqModule],
    controllers: [AppController],
    providers: [AppWalletService]
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(UserAgentMiddleware, LoggerMiddleware).forRoutes('*')
    }
}
