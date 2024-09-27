import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { NestExpressApplication } from '@nestjs/platform-express'
import { WebAccountModule } from '@web-account-service/web-account.module'
import { useSwagger } from '@/swagger/web-account-service'
import * as web from '@/config/web-instance'
import * as express from 'express'
import * as cookieParser from 'cookie-parser'
import * as path from 'path'

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(WebAccountModule, {
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
    //全局注册验证管道
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }))
    //挂载文档
    await useSwagger(app)
    //监听端口服务
    await app.listen(web.WebAccountService.port).then(() => {
        console.log(
            `[${web.WebAccountService.namespace}]-${web.WebAccountService.title}启动:`,
            `http://localhost:${web.WebAccountService.port}`,
            `http://localhost:${web.WebAccountService.port}/${web.WebAccountService.document}`
        )
    })
}
bootstrap()
