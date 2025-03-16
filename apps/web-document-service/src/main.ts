import { NestFactory } from '@nestjs/core'
import { knife4jSetup } from 'nest-knife4j'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { WebDocumentModule } from '@web-document-service/web-document.module'
import { knife4jOption, documentOptions } from '@/config/web-document'

export async function fetchProxyMiddleware(app: any) {
    await knife4jSetup(app, knife4jOption)
    documentOptions.forEach(item => {
        app.use(
            item.prefix,
            createProxyMiddleware({
                target: item.baseUrl,
                changeOrigin: true,
                pathRewrite: path => `${item.prefix}${path}`
            })
        )
    })
    return app
}

async function bootstrap() {
    const app = await NestFactory.create(WebDocumentModule)
    return await fetchProxyMiddleware(app).then(async () => {
        return await app.listen(3000).then(() => {
            console.log(`昆仑服务平台-API文档服务启动:`, `http://localhost:3000`, `http://localhost:3000/doc.html`)
        })
    })
}
bootstrap()
