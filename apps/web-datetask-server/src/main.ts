import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { AppModule } from '@web-datetask-server/app.module'
import { closeHotModule, setupHotModule } from '@/utils/modules/hmr'

declare const module: any

async function bootstrap() {
    await closeHotModule(module).then(async () => {
        const app = await NestFactory.create<NestExpressApplication>(AppModule)
        await app.listen(process.env.NODE_WEB_DATETASK_PORT).then(() => {
            console.log(`ChatBook定时任务服务启动[${process.env.NODE_ENV}]:`, `http://localhost:${process.env.NODE_WEB_DATETASK_PORT}`)
        })
        return setupHotModule(module, app)
    })
}
bootstrap()
