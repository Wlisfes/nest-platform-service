import { Controller, Get, Redirect } from '@nestjs/common'

@Controller()
export class WebDocumentController {
    @Get('/')
    @Redirect('http://localhost:3000/doc.html', 302)
    public async httpBaseRedirect() {}
}
