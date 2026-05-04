import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { AppModule } from '@web-windows-server/app.module'
import { setupSwagger } from '@/swagger'
import { closeHotModule, setupHotModule } from '@/utils/modules/hmr'

declare const module: any

async function bootstrap() {
    await closeHotModule(module).then(async () => {
        const app = await NestFactory.create<NestExpressApplication>(AppModule, {
            cors: true
        })
        app.setGlobalPrefix('/api/windows')
        await setupSwagger(app, {
            title: `ChatBook管理平台API服务`,
            description: `ChatBook Management Platform API Service`,
            port: process.env.NODE_WEB_WINDOWS_PORT
        }).then(() => {
            console.log(
                `ChatBook管理平台API服务启动[${process.env.NODE_ENV}]:`,
                `http://localhost:${process.env.NODE_WEB_WINDOWS_PORT}`,
                `http://localhost:${process.env.NODE_WEB_WINDOWS_PORT}/api/swagger`
            )
        })
        return setupHotModule(module, app)
    })
}
bootstrap()
