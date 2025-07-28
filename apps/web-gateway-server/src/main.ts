import { NestFactory } from '@nestjs/core'
import { AppModule } from '@web-gateway-server/app.module'
import { setupProxyMiddleware } from '@/utils'

async function bootstrap() {
    const app = await NestFactory.create(AppModule)
    return await setupProxyMiddleware(app).then(async () => {
        return await app.listen(process.env.NODE_WEB_GATEWAY_PORT).then(() => {
            console.log(
                `ChatBook网关服务平台启动[${process.env.NODE_ENV}]:`,
                `http://localhost:${process.env.NODE_WEB_GATEWAY_PORT}`,
                `http://localhost:${process.env.NODE_WEB_GATEWAY_PORT}/doc.html`
            )
        })
    })
}
bootstrap()
