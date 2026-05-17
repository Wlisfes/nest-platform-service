import { Injectable } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { DataBaseService, WindowsService, SmsService, enums } from '@/modules/database/database.service'
import { FinanceBrandUtilsService } from '@web-windows-server/modules/finance/brand/brand.utils.service'
import { DeployAccountUtilsService } from '@web-windows-server/modules/deploy/account/account.utils.service'
import { isEmpty } from '@/utils'
import { OmixRequest } from '@/interface'
import * as windows from '@web-windows-server/interface'

@Injectable()
export class CrmClientUtilsService extends Logger {
    constructor(
        private readonly database: DataBaseService,
        private readonly windows: WindowsService,
        private readonly smsService: SmsService,
        private readonly brandUtilsService: FinanceBrandUtilsService,
        private readonly deployAccountUtilsService: DeployAccountUtilsService
    ) {
        super()
    }

    /**根据keyId查询C端客户信息**/
    @AutoDescriptor
    public async fetchUtilsByKeyIdClient(request: OmixRequest, body: Omix<{ keyId: number }>) {
        return await this.database.empty(this.windows.clientOptions, {
            request,
            message: '客户不存在',
            dispatch: { where: { keyId: body.keyId } }
        })
    }

    /**生成C端客户账号别名**/
    @AutoDescriptor
    public async fetchUtilsNewClientAlias(request: OmixRequest, body: windows.UtilsNewClientAliasOptions) {
        const brandOptions = await this.brandUtilsService.fetchUtilsByKeyIdBrand(request, { keyId: body.brandId })
        return await this.database.builder(this.windows.clientOptions, async qb => {
            qb.where(`t.userId = :userId AND t.brandId = :brandId`, { userId: request.user.uid, brandId: body.brandId })
            qb.orderBy('t.keyId', 'DESC')
            return await qb.getOne().then(async node => {
                if (isEmpty(node)) {
                    return `${brandOptions.name}${body.number}0001`
                }
                const n = Number(node.alias.replace(brandOptions.name, '').replace(body.number, ''))
                return `${brandOptions.name}${body.number}${(n + 1).toString().padStart(4, '0')}`
            })
        })
    }

    /**生成C端客户短信应用别名**/
    @AutoDescriptor
    public async fetchUtilsNewClientSmsAlias(request: OmixRequest, body: windows.UtilsNewClientSmsAliasOptions) {
        const clientOptions = await this.fetchUtilsByKeyIdClient(request, {
            keyId: body.clientId
        })
        const accountOptions = await this.deployAccountUtilsService.fetchUtilsUidByAccount(request, {
            uid: clientOptions.userId
        })
        const brandOptions = await this.brandUtilsService.fetchUtilsByKeyIdBrand(request, {
            keyId: clientOptions.brandId
        })
        return await this.database.builder(this.smsService.tbSmsAppOptions, async qb => {
            qb.where(`t.userId = :userId `, { userId: clientOptions.userId })
            qb.orderBy('t.keyId', 'DESC')
            return await qb.getOne().then(async node => {
                const { suffix } = enums.CHUNK_CLIENT_SMS_TYPE[body.type]
                const prefix = `${brandOptions.name}${accountOptions.number}`
                if (isEmpty(node)) {
                    return `${prefix}A01${suffix}`
                }
                /**提取3位编码（如 A01）并自增**/
                const code = node.appAlias.slice(prefix.length, prefix.length + 3)
                const letter = code.charAt(0)
                const num = parseInt(code.substring(1), 10)
                const nextLetter = num < 99 ? letter : String.fromCharCode(letter.charCodeAt(0) + 1)
                const nextNum = num < 99 ? num + 1 : 1
                return `${prefix}${nextLetter}${nextNum.toString().padStart(2, '0')}${suffix}`
            })
        })
    }
}
