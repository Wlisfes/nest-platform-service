import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import * as web from '@/config/web-instance'

/**文档挂载**/
export async function useSwagger(app) {
    const options = new DocumentBuilder()
        .setTitle(web.WebSystemService.title)
        .setDescription(web.WebSystemService.description)
        .setVersion('1.0.0')
        .addBearerAuth({ type: 'apiKey', in: 'header', name: web.WEB_COMMON_HEADER_AUTHORIZE }, web.WEB_COMMON_HEADER_AUTHORIZE)
        .build()
    const document = SwaggerModule.createDocument(app, options)
    SwaggerModule.setup(web.WebSystemService.document, app, document, {
        customSiteTitle: web.WebSystemService.siteTitle,
        swaggerOptions: {
            defaultModelsExpandDepth: -1,
            defaultModelExpandDepth: 5,
            filter: true,
            docExpansion: 'none'
        }
    })
    return app
}
