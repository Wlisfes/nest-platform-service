import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common'
import { APP_INTERCEPTOR, APP_FILTER, APP_GUARD } from '@nestjs/core'
import { LoggerMiddleware } from '@/middleware/logger.middleware'
import { UserAgentMiddleware } from '@/middleware/useragent.middleware'
import { AuthGuard } from '@/guard/auth.guard'
import { TransformInterceptor } from '@/interceptor/transform.interceptor'
import { HttpExceptionFilter } from '@/filter/http-exception.filter'
//modules
import { ConfigerModule } from '@/modules/configer.module'
import { LoggerModule } from '@/modules/logger.module'
import { ThrottlerModule } from '@/modules/throttler.module'
import { DatabaseModule } from '@/modules/database.module'
//wheres
import { WhereMemberService } from '@/wheres/where-member.service'
import { WhereDeptService } from '@/wheres/where-dept.service'
import { WhereSimpleService } from '@/wheres/where-simple.service'
//services
import { DeptService } from '@web-system-service/services/dept.service'
import { SimpleService } from '@web-system-service/services/simple.service'
//controllers
import { DeptController } from '@web-system-service/controllers/dept.controller'
import { SimpleController } from '@web-system-service/controllers/simple.controller'

@Module({
    imports: [LoggerModule.forRoot({ name: 'web-account-service' }), ConfigerModule, ThrottlerModule, DatabaseModule],
    controllers: [DeptController, SimpleController],
    providers: [
        { provide: APP_GUARD, useClass: AuthGuard },
        { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
        { provide: APP_FILTER, useClass: HttpExceptionFilter },
        WhereMemberService,
        WhereDeptService,
        WhereSimpleService,
        DeptService,
        SimpleService
    ]
})
export class WebSystemModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(UserAgentMiddleware, LoggerMiddleware).forRoutes('*')
    }
}
