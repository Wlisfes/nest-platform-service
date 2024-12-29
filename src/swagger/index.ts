import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import * as express from 'express'
import * as cookieParser from 'cookie-parser'
export interface OptionSwagger {
    title: string
    siteTitle: string
    description: string
    jwtName: string
    link: string
    port: number
    version?: string
}

/**文档挂载**/
export async function setupSwagger(app, opt: OptionSwagger) {
    /**允许跨域**/
    app.enableCors()
    /**解析body参数**/
    app.use(cookieParser())
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))
    /**初始化文档**/
    const builder = new DocumentBuilder()
        .setTitle(opt.title)
        .setDescription(opt.description)
        .setVersion(opt.version ?? '1.0.0')
        .addBearerAuth({ type: 'apiKey', in: 'header', name: opt.jwtName }, opt.jwtName)
        .build()
    const document = SwaggerModule.createDocument(app, builder)
    SwaggerModule.setup(opt.link, app, document, {
        customSiteTitle: opt.siteTitle,
        swaggerOptions: {
            defaultModelsExpandDepth: -1,
            defaultModelExpandDepth: 5,
            filter: true,
            docExpansion: 'none'
        }
    })
    return await app.listen(opt.port).then(() => {
        console.log(`${opt.title}启动:`, `http://localhost:4070`, `http://localhost:4070/${opt.link}`)
    })
}
