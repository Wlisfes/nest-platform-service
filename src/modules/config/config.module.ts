import { Module, Global } from '@nestjs/common'
import { ConfigModule as NestConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule, JwtService as Jwt } from '@nestjs/jwt'

@Global()
@Module({
    imports: [
        NestConfigModule.forRoot({ isGlobal: true, cache: true }),
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                global: true,
                secret: configService.get('JWT_SECRET')
            })
        })
    ],
    controllers: [],
    providers: [ConfigService, Jwt],
    exports: [ConfigService, Jwt]
})
export class ConfigModule {}
