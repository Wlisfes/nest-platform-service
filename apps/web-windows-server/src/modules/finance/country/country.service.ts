import { Injectable, HttpException } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { DataBaseService, WindowsService, schema, enums } from '@/modules/database/database.service'
import { isNotEmpty } from '@/utils'
import { OmixRequest } from '@/interface'
import * as windows from '@web-windows-server/interface'

@Injectable()
export class FinanceCountryService extends Logger {
    constructor(private readonly database: DataBaseService, private readonly windows: WindowsService) {
        super()
    }

    /**分页列表查询**/
    @AutoDescriptor
    public async httpBaseFinanceColumnCountry(request: OmixRequest, body: windows.ColumnCountryOptions) {
        try {
            return await this.database.builder(this.windows.countryOptions, async qb => {
                if (isNotEmpty(body.cnName)) {
                    qb.andWhere(`t.cnName LIKE :cnName OR t.enName LIKE :cnName OR t.code LIKE :cnName`, {
                        cnName: `%${body.cnName}%`
                    })
                }
                if (isNotEmpty(body.status)) {
                    qb.andWhere(`t.status = :status`, { status: body.status })
                }
                qb.orderBy('t.createTime', 'DESC')
                qb.skip((body.page - 1) * body.size)
                qb.take(body.size)
                return await qb.getManyAndCount().then(async ([list, total]) => {
                    return await this.fetchResolver({ page: body.page, size: body.size, total, list })
                })
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        }
    }

    /**状态修改**/
    @AutoDescriptor
    public async httpBaseFinanceUpdateCountryStatus(request: OmixRequest, body: windows.UpdateCountryStatusOptions) {
        const ctx = await this.database.transaction()
        try {
            /**验证国家/地区存在**/
            await this.database.empty(this.windows.countryOptions, {
                request,
                message: 'keyId:不存在',
                dispatch: { where: { keyId: body.keyId } }
            })
            await this.database.update(ctx.manager.getRepository(schema.WindowsCountry), {
                request,
                stack: this.stack,
                where: { keyId: body.keyId },
                body: { status: body.status }
            })
            return await ctx.commitTransaction().then(async () => {
                return await this.fetchResolver({ message: '操作成功' })
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        } finally {
            await ctx.release()
        }
    }

    /**国家下拉列表（启用状态）**/
    @AutoDescriptor
    public async httpBaseFinanceSelectCountry(request: OmixRequest) {
        try {
            return await this.database.builder(this.windows.countryOptions, async qb => {
                qb.select(['t.keyId', 't.code', 't.cnName', 't.mcc', 't.enName'])
                qb.andWhere(`t.status = :status`, { status: enums.CHUNK_COUNTRY_STATUS.enable.value })
                qb.orderBy('t.createTime', 'DESC')
                return await qb.getMany().then(async list => {
                    return await this.fetchResolver({
                        list: list.map(item => ({ ...item, showName: `${item.cnName} -${item.enName}` }))
                    })
                })
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        }
    }
}
