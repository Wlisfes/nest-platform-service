import { Injectable } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { DataBaseService, WindowsService, SmsService } from '@/modules/database/database.service'
import { FinanceBrandUtilsService } from '@web-windows-server/modules/finance/brand/brand.utils.service'
import { fetchCloneByte, isEmpty } from '@/utils'
import { OmixRequest } from '@/interface'
import * as windows from '@web-windows-server/interface'

@Injectable()
export class CrmClientUtilsService extends Logger {
    constructor(
        private readonly database: DataBaseService,
        private readonly windows: WindowsService,
        private readonly smsService: SmsService,
        private readonly brandUtilsService: FinanceBrandUtilsService
    ) {
        super()
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
}
