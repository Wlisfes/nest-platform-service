import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { HttpService } from '@nestjs/axios'
import { ApiDecorator } from '@/decorator/compute.decorator'
import { faker } from '@/utils/utils-common'

@ApiTags('用户模块')
@Controller('user')
export class UserController {
    constructor(private readonly httpService: HttpService) {}

    @Get('/create')
    @ApiDecorator({
        operation: { summary: '测试接口' },
        response: { status: 200, description: 'OK' }
    })
    public async httpCreateUser() {}
}
