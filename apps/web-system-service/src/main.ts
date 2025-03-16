import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { WebSystemModule } from '@web-system-service/web-system.module'
import { setupSwagger } from '@/swagger'
import * as path from 'path'

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(WebSystemModule, {
        cors: true
    })
    app.useStaticAssets(path.join(__dirname, '../../../', 'src/public'))
    app.setGlobalPrefix('/api')
    return await setupSwagger(app, {
        title: '昆仑服务平台',
        siteTitle: '昆仑服务平台API文档',
        description: 'Kunlun Service Platform API Documentation',
        port: 3020
    })
}
bootstrap()
