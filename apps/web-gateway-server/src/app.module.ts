import { Module } from '@nestjs/common'
import { ConfigModule } from '@/modules/config/config.module'
import { AppController } from '@web-gateway-server/app.controller'

@Module({
    imports: [ConfigModule],
    controllers: [AppController]
})
export class AppModule {}
