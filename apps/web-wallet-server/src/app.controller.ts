import { Controller, Get } from '@nestjs/common'

@Controller()
export class AppController {
    @Get('/')
    public async httpBaseRedirect() {
        return `<h1>ChatBook管理平台钱包扣费服务</h1>`
    }
}
