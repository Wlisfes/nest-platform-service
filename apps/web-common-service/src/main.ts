import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { WebCommonModule } from '@web-common-service/web-common.module'
import { setupSwagger } from '@/swagger'
import * as path from 'path'

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(WebCommonModule, {
        cors: true
    })
    app.useStaticAssets(path.join(__dirname, '../../../', 'src/public'))
    app.setGlobalPrefix('/api/common')
    return await setupSwagger(app, {
        title: '昆仑服务平台-公共端',
        siteTitle: '昆仑服务平台API文档',
        description: 'Kunlun Service Platform API Documentation',
        port: 3050
    })
}
bootstrap()
