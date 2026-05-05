import { Module, OnModuleInit } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { BullModule } from '@nestjs/bullmq'
import { ConfigModule } from '@/modules/config/config.module'
import { LoggerModule } from '@/modules/logger/logger.module'
import { DatabaseModule } from '@/modules/database/database.module'
import { RedisModule } from '@/modules/redis/redis.module'
import { DatetaskModule } from '@web-datetask-server/modules/datetask/datetask.module'
import { ExchangeModule } from '@web-datetask-server/modules/exchange/exchange.module'
import { AppService } from '@web-datetask-server/app.service'
import { AppController } from '@web-datetask-server/app.controller'

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
        DatetaskModule,
        ExchangeModule
    ],
    providers: [AppService],
    controllers: [AppController]
})
export class AppModule implements OnModuleInit {
    constructor(private readonly moduleRef: ModuleRef) {}

    /**定时任务初始化（使用 moduleRef.resolve 解决 REQUEST 作用域冒泡问题）**/
    async onModuleInit() {
        const appService = await this.moduleRef.resolve(AppService)
        return appService.fetchDatetaskInitialization()
    }
}
