import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common'
import { APP_INTERCEPTOR, APP_FILTER, APP_GUARD } from '@nestjs/core'
import { UserAgentMiddleware, LoggerMiddleware } from '@/middleware'
import { TransformInterceptor } from '@/interceptor'
import { HttpExceptionFilter } from '@/filters'
import { AuthWindowsGuard } from '@/guard'
import { ConfigModule } from '@/modules/config/config.module'
import { LoggerModule } from '@/modules/logger/logger.module'
import { DatabaseModule } from '@/modules/database/database.module'
import { RedisModule } from '@/modules/redis/redis.module'
import { JwtModule } from '@/modules/jwt/jwt.module'
import { CommonModule } from '@/modules/common/common.module'
import { AuthModule } from '@web-windows-server/modules/auth/auth.module'
import { ChunkModule } from '@web-windows-server/modules/chunk/chunk.module'
import { SystemModule } from '@web-windows-server/modules/system/system.module'

@Module({
    imports: [LoggerModule, ConfigModule, DatabaseModule, RedisModule, JwtModule, CommonModule, AuthModule, ChunkModule, SystemModule],
    providers: [
        { provide: APP_GUARD, useClass: AuthWindowsGuard },
        { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
        { provide: APP_FILTER, useClass: HttpExceptionFilter }
    ]
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(UserAgentMiddleware, LoggerMiddleware).forRoutes('*')
    }
}
