import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { NestExpressApplication } from '@nestjs/platform-express'
import { WebSystemModule } from '@web-system-service/web-system.module'
import * as express from 'express'
import * as cookieParser from 'cookie-parser'
import * as path from 'path'

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(WebSystemModule, {
        cors: true
    })
    //允许跨域
    app.enableCors()
    //静态资源路径
    app.useStaticAssets(path.join(__dirname, '../../../', 'src/public'))
    //解析body参数
    app.use(cookieParser())
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))
    //接口前缀
    //全局注册验证管道
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }))
    //挂载文档
}
bootstrap()
