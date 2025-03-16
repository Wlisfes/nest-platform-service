import { NestFactory } from '@nestjs/core'
import { knife4jSetup } from 'nest-knife4j'
import { WebDocumentModule } from '@web-document-service/web-document.module'

async function bootstrap() {
    const app = await NestFactory.create(WebDocumentModule)
    knife4jSetup(app, [
        {
            name: 'web-common-service',
            url: `http://localhost:3010/api/swagger-json`,
            swaggerVersion: '1.0.0',
            location: `http://localhost:3010/api/swagger-json`
        },
        {
            name: 'web-system-service',
            url: `http://localhost:3020/api/swagger-json`,
            swaggerVersion: '1.0.0',
            location: `http://localhost:3020/api/swagger-json`
        }
    ])

    return await app.listen(3000).then(() => {
        console.log(`API文档启动:`, `http://localhost:3000`, `http://localhost:3000/doc.html`)
    })
}
bootstrap()
