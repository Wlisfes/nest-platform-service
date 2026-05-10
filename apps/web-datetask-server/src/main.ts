import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { Transport, MicroserviceOptions } from '@nestjs/microservices'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from '@web-datetask-server/app.module'
import { closeHotModule, setupHotModule } from '@/utils/modules/hmr'

declare const module: any

async function bootstrap() {
    await closeHotModule(module).then(async () => {
        const app = await NestFactory.create<NestExpressApplication>(AppModule)
        app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }))
        app.connectMicroservice<MicroserviceOptions>(
            {
                transport: Transport.TCP,
                options: { host: '0.0.0.0', port: process.env.NODE_WEB_DATETASK_TCP_PORT }
            },
            { inheritAppConfig: true }
        )
        await app.startAllMicroservices()
        await app.listen(process.env.NODE_WEB_DATETASK_PORT).then(() => {
            console.log(
                `ChatBook定时任务服务启动[${process.env.NODE_ENV}]:`,
                `TCP端口: ${process.env.NODE_WEB_DATETASK_TCP_PORT}`,
                `HTTP端口: http://localhost:${process.env.NODE_WEB_DATETASK_PORT}`
            )
        })
    })
}
bootstrap()
