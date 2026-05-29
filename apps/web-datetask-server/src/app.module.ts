import { Module, OnModuleInit } from '@nestjs/common'
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { BullModule } from '@nestjs/bullmq'
import { ConfigModule } from '@/modules/config/config.module'
import { LoggerModule } from '@/modules/logger/logger.module'
import { DatabaseModule } from '@/modules/database/database.module'
import { RedisModule } from '@/modules/redis/redis.module'
import { RpcExceptionFilter } from '@/filters'
import { TransformInterceptor } from '@/interceptor'
import { DatetaskModule } from '@web-datetask-server/modules/datetask/datetask.module'
import { SystemModule } from '@web-datetask-server/modules/system/system.module'
import { ExchangeModule } from '@web-datetask-server/modules/exchange/exchange.module'
import { FormosanModule } from '@web-datetask-server/modules/formosan/formosan.module'
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
        SystemModule,
        ExchangeModule,
        FormosanModule
    ],
    providers: [
        { provide: APP_FILTER, useClass: RpcExceptionFilter },
        { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
        AppService
    ],
    controllers: [AppController]
})
export class AppModule implements OnModuleInit {
    constructor(private readonly appService: AppService) {}

    /**定时任务初始化**/
    async onModuleInit() {
        return this.appService.fetchDatetaskInitialization()
    }
}
