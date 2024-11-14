import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { firstValueFrom } from 'rxjs'
import { HttpService } from '@nestjs/axios'
import { ApiDecorator } from '@/decorator/compute.decorator'
import { faker, fetchDelay } from '@/utils/utils-common'

@ApiTags('用户模块')
@Controller('user')
export class UserController {
    constructor(private readonly httpService: HttpService) {}

    @Get('/create')
    @ApiDecorator({
        operation: { summary: '测试接口' },
        response: { status: 200, description: 'OK' }
    })
    public async httpCreateUser() {
        // return {
        //     email: faker.internet.email(),
        //     name: faker.person.fullName()
        // }

        for (let index = 1; index < 5; index++) {
            const response = await firstValueFrom(
                this.httpService.request({
                    url: `http://gw-kunlun-test.praise.com/v2/emailbox/email/book/save`,
                    method: 'POST',
                    headers: {
                        authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJsZWFkZXIiOmZhbHNlLCJhdWQiOlsiIl0sImxvZ2luVHlwZSI6bnVsbCwidXNlcl9uYW1lIjoiMTIzMyIsImRpbmdfaWQiOiIxNjQ3ODI3OTUzNjg3OTcwIiwic2NvcGUiOlsic3RhZmYiXSwiY19uYW1lIjoiNXAyTzZhT2UiLCJpZCI6MTAwMzU3LCJqb2JfbnVtYmVyIjoiMTIzMyIsImV4cCI6MTczMTM4MDMxMCwianRpIjoiYjBhNzhjN2YtYmYyYS00YzBmLWIwZGUtNDQyNWNmZGUxOWUzIiwiY2xpZW50X2lkIjoic2t5bGluZS1zdGFmZi1rdW5sdW4ifQ.eAOpEnFZ0kB3uDs74agtPk8zdvcrS7Ke3mP4glGyCUHcHs4m2aVKObd6WqVmdQhNLU0wJaen7KZrDSfm4wBXbNZ7h-GWROdHfdpsOEGzBT_s--ny0wELPNGbkFCxDDlsLVVTZTJQ4rxTMtfKmVnIdQc8s4jl58_g6VGkxUgCY8YFSV1J4M0_m0t234pnTz2UDDW1QEQUKIEXsgDIpGYu3TXgxmUIwlPPsXPyiqRh0OPIaClTLBfTUbJXGQMorEUhIoLIj6_UDBNdMzZYgtiZlDAwSdJT1gXCfUh6HsMphvr4fpkFevELMPNAz6uA8wTDIfzNrKWBoa4YtcrV8nbIRQ`
                    },
                    data: {
                        phone: '',
                        company: '',
                        remark: '',
                        name: faker.person.fullName(),
                        email: Array.from({ length: index }, () => faker.internet.email()).join(',')
                    }
                })
            )
            console.log(response.data)
            await fetchDelay(20)
        }

        return {
            email: faker.internet.email(),
            name: faker.person.fullName()
        }

        // return await firstValueFrom(
        //     this.httpService.request({
        //         url: `http://gw-kunlun-test.praise.com/v2/emailbox/email/book/save`,
        //         method: 'POST',
        //         headers: {
        //             authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJsZWFkZXIiOmZhbHNlLCJhdWQiOlsiIl0sImxvZ2luVHlwZSI6bnVsbCwidXNlcl9uYW1lIjoiMTIzMyIsImRpbmdfaWQiOiIxNjQ3ODI3OTUzNjg3OTcwIiwic2NvcGUiOlsic3RhZmYiXSwiY19uYW1lIjoiNXAyTzZhT2UiLCJpZCI6MTAwMzU3LCJqb2JfbnVtYmVyIjoiMTIzMyIsImV4cCI6MTczMTMzNTcyNywianRpIjoiZmZkMjQ3MTgtYjQ5Ni00MGZjLWI5ZDctYjZkODZmYWE4ZTAyIiwiY2xpZW50X2lkIjoic2t5bGluZS1zdGFmZi1rdW5sdW4ifQ.hwHNv8MEhsAmlM5pmEIYG33wswZIUQT2SON5plJnuVMlLJwwnJbmGOHLsDI1s0s4MPxejdZb1vivhhTDMSkkTOt-D1KE4LpGFz-KGEs255q5KNXqqwlP5DODteM-yjyB3Cb4N52MAOcIvMLLuSHHrtYN9um3c8oZXbYUwkSlW1YT5xxbdjCB2u9FaqQMwi7BSi_XUmmQv1Fc3dG2xCKe-lDxfsUCkYt332SrI8LZ-mU7u0uEPjmOukoAn7XIev0wIOhei22f6emaGaa7obT3Z4ovyy22Wq9wkfzNFGI_QefPzicK2B0LEQA06jLUhESKMg5NFypeKOQUoaSO691O6w`
        //         },
        //         data: {
        //             appSecret: 'zzFznmt8DY64hHBnkoboTmUzFZIadSdV',
        //             appId: '169851019895347735',
        //             session: state.session,
        //             token: state.token
        //         }
        //     })
        // )
    }
}
