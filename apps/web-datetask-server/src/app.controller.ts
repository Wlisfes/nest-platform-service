import { Controller, Get } from '@nestjs/common'

@Controller()
export class AppController {
    @Get('/')
    public async httpBaseRedirect() {
        return `<h1>ChatBook定时任务服务</h1>`
    }
}
