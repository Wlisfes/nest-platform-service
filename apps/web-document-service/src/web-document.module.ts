import { Module } from '@nestjs/common'
import { WebDocumentController } from '@web-document-service/web-document.controller'

@Module({
    controllers: [WebDocumentController]
})
export class WebDocumentModule {}
