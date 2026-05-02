import { Injectable } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { DataBaseService, WindowsService, schema } from '@/modules/database/database.service'
import { isNotEmpty } from '@/utils'
import { OmixRequest } from '@/interface'

@Injectable()
export class FinanceCountryUtilsService extends Logger {
    constructor(private readonly database: DataBaseService, private readonly windows: WindowsService) {
        super()
    }

    /**批量查询国家/地区**/
    @AutoDescriptor
    public async fetchUtilsByColumnCountry(request: OmixRequest, body: Omix<{ codes: Array<string> }>) {
        if (body.codes.length === 0) {
            return []
        } else {
            return await this.database.builder(this.windows.countryOptions, async qb => {
                const fields: Array<keyof schema.WindowsCountry> = ['keyId', 'status', 'code', 'mcc', 'cnName', 'enName']
                qb.select(fields.map(f => `t.${f}`))
                qb.where(`t.code IN (:...codes)`, { codes: [...new Set(body.codes.filter(isNotEmpty))] })
                return await qb.getMany()
            })
        }
    }
}
