import { Controller, Get, Response } from '@nestjs/common'

@Controller()
export class AppController {
    @Get('/')
    public async httpBaseRedirect(@Response() response) {
        return response.redirect(301, `http://localhost:${process.env.NODE_WEB_GATEWAY_PORT}/doc.html`)
    }
}
