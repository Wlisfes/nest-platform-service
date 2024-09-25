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
import { DeptService } from '@web-account-service/services/dept.service'
import { SimpleService } from '@web-account-service/services/simple.service'
import { MemberService } from '@web-account-service/services/member.service'
//controllers
import { UserController } from '@web-account-service/controllers/user.controller'
import { DeptController } from '@web-account-service/controllers/dept.controller'
import { SimpleController } from '@web-account-service/controllers/simple.controller'
import { MemberController } from '@web-account-service/controllers/member.controller'

@Module({
    imports: [LoggerModule.forRoot({ name: 'web-account-service' }), ConfigerModule, ThrottlerModule, DatabaseModule],
    controllers: [UserController, DeptController, SimpleController, MemberController],
    providers: [
        { provide: APP_GUARD, useClass: AuthGuard },
        { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
        { provide: APP_FILTER, useClass: HttpExceptionFilter },
        WhereMemberService,
        WhereDeptService,
        WhereSimpleService,
        DeptService,
        SimpleService,
        MemberService
    ]
})
export class WebAuthModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(UserAgentMiddleware, LoggerMiddleware).forRoutes('*')
    }
}
