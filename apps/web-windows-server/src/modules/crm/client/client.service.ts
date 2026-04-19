import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { DataBaseService, WindowsService, schema, enums } from '@/modules/database/database.service'
import { isNotEmpty } from '@/utils'
import { OmixRequest } from '@/interface'
import * as windows from '@web-windows-server/interface'

/**金额放大倍数**/
const AMOUNT_SCALE = 1_000_000

@Injectable()
export class CrmClientService extends Logger {
    constructor(private readonly database: DataBaseService, private readonly windows: WindowsService) {
        super()
    }

    /**分页列表查询**/
    @AutoDescriptor
    public async httpBaseCrmClientCommonConsumer(request: OmixRequest, body: windows.BaseCrmClientCommonConsumerOptions) {
        try {
            return await this.database.builder(this.windows.clientOptions, async qb => {
                if (isNotEmpty(body.name)) {
                    qb.andWhere(`t.name LIKE :name`, { name: `%${body.name}%` })
                }
                if (isNotEmpty(body.status)) {
                    qb.andWhere(`t.status = :status`, { status: body.status })
                }
                if (isNotEmpty(body.brandId)) {
                    qb.andWhere(`t.brandId = :brandId`, { brandId: body.brandId })
                }
                if (isNotEmpty(body.currency)) {
                    qb.andWhere(`t.currency = :currency`, { currency: body.currency })
                }
                if (isNotEmpty(body.payMode)) {
                    qb.andWhere(`t.payMode = :payMode`, { payMode: body.payMode })
                }
                if (isNotEmpty(body.authStatus)) {
                    qb.andWhere(`t.authStatus = :authStatus`, { authStatus: body.authStatus })
                }
                if (isNotEmpty(body.source)) {
                    qb.andWhere(`t.source = :source`, { source: body.source })
                }
                qb.orderBy('t.createTime', 'DESC')
                qb.skip((body.page - 1) * body.size)
                qb.take(body.size)
                return await qb.getManyAndCount().then(async ([list, total]) => {
                    const converted = list.map(item => ({
                        ...item,
                        balance: Number(item.balance) / AMOUNT_SCALE,
                        credit: Number(item.credit) / AMOUNT_SCALE
                    }))
                    return await this.fetchResolver({ page: body.page, size: body.size, total, list: converted })
                })
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        }
    }
}
