import { Injectable, HttpException } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { DataBaseService, WindowsService, schema } from '@/modules/database/database.service'
import { DeployAccountUtilsService } from '@web-windows-server/modules/deploy/account/account.utils.service'
import { FinanceCountryUtilsService } from '@web-windows-server/modules/finance/country/country.utils.service'
import { isNotEmpty, fetchObsUpdate, fetchCurrent } from '@/utils'
import { OmixRequest } from '@/interface'
import * as windows from '@web-windows-server/interface'

@Injectable()
export class FinanceSmsRateService extends Logger {
    constructor(
        private readonly database: DataBaseService,
        private readonly windows: WindowsService,
        private readonly accountUtilsService: DeployAccountUtilsService,
        private readonly countryUtilsService: FinanceCountryUtilsService
    ) {
        super()
    }

    @AutoDescriptor
    public async httpBaseFinanceCreateBasicSmsRate(request: OmixRequest, body: windows.CreateBasicSmsRateOptions) {
        const ctx = await this.database.transaction()
        try {
            await this.database.notempty(this.windows.basicSmsRateOptions, {
                request,
                message: '该国家/地区的移动代码已配置过价格',
                dispatch: { where: { code: body.code, mcc: body.mcc } }
            })
            await this.database.create(ctx.manager.getRepository(schema.WindowsBasicSmsRate), {
                request,
                stack: this.stack,
                body: { ...body }
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

    @AutoDescriptor
    public async httpBaseFinanceUpdateBasicSmsRate(request: OmixRequest, body: windows.UpdateBasicSmsRateOptions) {
        const ctx = await this.database.transaction()
        try {
            await this.database.empty(this.windows.basicSmsRateOptions, {
                request,
                message: '数据不存在',
                dispatch: { where: { keyId: body.keyId } }
            })
            const duplicate = await this.windows.basicSmsRateOptions.findOne({ where: { code: body.code, mcc: body.mcc } })
            if (duplicate && duplicate.keyId !== body.keyId) {
                throw new HttpException('该国家/地区的移动代码已配置过价格', 400)
            }
            await this.database.update(ctx.manager.getRepository(schema.WindowsBasicSmsRate), {
                request,
                stack: this.stack,
                where: { keyId: body.keyId },
                body: {
                    code: body.code,
                    mcc: body.mcc,
                    upUsd: body.upUsd,
                    downUsd: body.downUsd,
                    remark: body.remark
                }
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

    @AutoDescriptor
    public async httpBaseFinanceColumnBasicSmsRate(request: OmixRequest, body: windows.ColumnBasicSmsRateOptions) {
        try {
            return await this.database.builder(this.windows.basicSmsRateOptions, async qb => {
                if (isNotEmpty(body.code)) {
                    qb.andWhere(`t.code LIKE :code`, { code: `%${body.code}%` })
                }
                if (isNotEmpty(body.mcc)) {
                    qb.andWhere(`t.mcc LIKE :mcc`, { mcc: `%${body.mcc}%` })
                }
                qb.orderBy('t.createTime', 'DESC')
                qb.skip((body.page - 1) * body.size)
                qb.take(body.size)
                return await qb.getManyAndCount().then(async ([list, total]) => {
                    const [accounts, countrys] = await Promise.all([
                        this.accountUtilsService.fetchUtilsColumnByAccount(request, { list }),
                        this.countryUtilsService.fetchUtilsByColumnCountry(request, {
                            codes: [...new Set(list.map(e => e.code).filter(isNotEmpty))]
                        })
                    ])
                    list.forEach((item: Omix) => {
                        return fetchObsUpdate(item, {
                            countryOptions: fetchCurrent(countrys, e => e.code === item.code),
                            createByOptions: fetchCurrent(accounts, e => e.uid === item.createBy),
                            modifyByOptions: fetchCurrent(accounts, e => e.uid === item.modifyBy)
                        })
                    })
                    return await this.fetchResolver({ page: body.page, size: body.size, total, list })
                })
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        }
    }
}
