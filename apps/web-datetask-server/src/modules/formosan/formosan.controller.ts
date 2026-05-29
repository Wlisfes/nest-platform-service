import { Controller } from '@nestjs/common'
import { MessagePattern, Payload } from '@nestjs/microservices'
import { FormosanService } from '@web-datetask-server/modules/formosan/formosan.service'
import * as datetask from '@web-datetask-server/interface'

@Controller()
export class FormosanController {
    constructor(private readonly formosanService: FormosanService) {}
}
