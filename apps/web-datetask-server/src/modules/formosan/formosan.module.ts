import { Module, Global } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { FormosanService } from '@web-datetask-server/modules/formosan/formosan.service'

@Global()
@Module({
    imports: [HttpModule],
    providers: [FormosanService],
    exports: [FormosanService]
})
export class FormosanModule {}
