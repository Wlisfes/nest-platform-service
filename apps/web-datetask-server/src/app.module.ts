import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { BullModule } from '@nestjs/bullmq'
import { ConfigModule } from '@/modules/config/config.module'
import { LoggerModule } from '@/modules/logger/logger.module'
import { DatabaseModule } from '@/modules/database/database.module'
import { RedisModule } from '@/modules/redis/redis.module'
import { ExchangeModule } from '@web-datetask-server/modules/exchange/exchange.module'
import { DatetaskManagerModule } from '@web-datetask-server/modules/datetask/datetask.module'

@Module({
    imports: [
        ScheduleModule.forRoot(),
        BullModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                connection: {
                    host: config.get('NODE_REDIS_HOST'),
                    port: Number(config.get('NODE_REDIS_PORT')),
                    password: config.get('NODE_REDIS_PASSWORD'),
                    db: Number(config.get('NODE_REDIS_DB'))
                }
            })
        }),
        LoggerModule,
        ConfigModule,
        DatabaseModule,
        RedisModule,
        DatetaskManagerModule,
        ExchangeModule
    ]
})
export class AppModule {}
