import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { WebAuthModule } from '@web-auth-service/web-auth.module'
import { useSwagger } from '@/swagger/web-auth-service'
import * as web from '@/config/web-instance'
import * as express from 'express'
import * as cookieParser from 'cookie-parser'

async function bootstrap() {
    const app = await NestFactory.create(WebAuthModule)
    //允许跨域
    app.enableCors()
    //解析body参数
    app.use(cookieParser())
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))
    //接口前缀
    app.setGlobalPrefix(web.WebAuthService.prefix)
    //全局注册验证管道
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }))
    //挂载文档
    await useSwagger(app)
    //监听端口服务
    await app.listen(web.WebAuthService.port).then(() => {
        console.log(
            `[${web.WebAuthService.namespace}]-${web.WebAuthService.title}启动:`,
            `http://localhost:${web.WebAuthService.port}`,
            `http://localhost:${web.WebAuthService.port}${web.WebAuthService.prefix}`,
            `http://localhost:${web.WebAuthService.port}/${web.WebAuthService.document}`
        )
    })
}
bootstrap()
