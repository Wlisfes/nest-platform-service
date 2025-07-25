import { Module, Global } from '@nestjs/common'
import { ConfigModule as NestConfigModule, ConfigService } from '@nestjs/config'

@Global()
@Module({
    imports: [NestConfigModule.forRoot({ isGlobal: true, cache: true })],
    controllers: [],
    providers: [ConfigService],
    exports: [ConfigService]
})
export class ConfigModule {}
