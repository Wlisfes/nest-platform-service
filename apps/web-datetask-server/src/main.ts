import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { AppModule } from '@web-datetask-server/app.module'

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule)
    await app.listen(process.env.NODE_WEB_DATETASK_PORT).then(() => {
        console.log(`ChatBook定时任务服务启动[${process.env.NODE_ENV}]:`, `http://localhost:${process.env.NODE_WEB_DATETASK_PORT}`)
    })
    app.enableShutdownHooks()
}
bootstrap()
