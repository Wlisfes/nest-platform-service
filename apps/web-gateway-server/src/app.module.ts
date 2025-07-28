import { Module } from '@nestjs/common'
import { AppController } from '@web-gateway-server/app.controller'

@Module({
    controllers: [AppController]
})
export class AppModule {}
