import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { ConfigModule } from '@/modules/config/config.module'
import { LoggerModule } from '@/modules/logger/logger.module'
import { DatabaseModule } from '@/modules/database/database.module'
import { RedisModule } from '@/modules/redis/redis.module'
import { ExchangeModule } from '@web-datetask-server/modules/exchange/exchange.module'

@Module({
    imports: [ScheduleModule.forRoot(), LoggerModule, ConfigModule, DatabaseModule, RedisModule, ExchangeModule]
})
export class AppModule {}
