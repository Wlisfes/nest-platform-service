import { Controller } from '@nestjs/common'
import { MessagePattern, Payload } from '@nestjs/microservices'
import { FormosanService } from '@web-datetask-server/modules/formosan/formosan.service'

@Controller()
export class FormosanController {
    constructor(private readonly formosanService: FormosanService) {}

    /**注册报价任务**/
    @MessagePattern({ cmd: 'fetchBaseFormosanTaskRegister' })
    public async fetchBaseFormosanTaskRegister(@Payload() payload) {
        return await this.formosanService.fetchBaseFormosanTaskRegister(payload.request, payload)
    }
}
