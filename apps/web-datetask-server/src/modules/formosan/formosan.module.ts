import { Module, Global } from '@nestjs/common'
import { FormosanService } from '@web-datetask-server/modules/formosan/formosan.service'
import { FormosanProcessor } from '@web-datetask-server/modules/formosan/formosan.processor'
import { FormosanController } from '@web-datetask-server/modules/formosan/formosan.controller'

@Global()
@Module({
    controllers: [FormosanController],
    providers: [FormosanService, FormosanProcessor],
    exports: [FormosanService, FormosanProcessor]
})
export class FormosanModule {}
