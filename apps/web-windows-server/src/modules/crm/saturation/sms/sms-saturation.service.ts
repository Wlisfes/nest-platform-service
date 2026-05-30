import { Injectable } from '@nestjs/common'
import { HttpException, HttpStatus } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { DataBaseService, SmsService, WindowsService, schema, enums } from '@/modules/database/database.service'
import { isNotEmpty } from '@/utils'
import { OmixRequest } from '@/interface'
import * as windows from '@web-windows-server/interface'

@Injectable()
export class SmsSaturationService extends Logger {
    constructor(
        private readonly database: DataBaseService,
        private readonly smsService: SmsService,
        private readonly windows: WindowsService
    ) {
        super()
    }

    /**报价查询-分页列表**/
    @AutoDescriptor
    public async httpSmsSaturationColumn(request: OmixRequest, body: windows.SmsSaturationColumnOptions) {
        try {
            return await this.database.builder(this.smsService.tbSmsAppFormosanOptions, async qb => {
                qb.leftJoinAndMapOne(
                    't.countryNode',
                    schema.WindowsCountry,
                    'country',
                    'country.code = t.code AND country.mcc = t.mcc'
                )
                qb.leftJoinAndMapOne(
                    't.appNode',
                    schema.TbSmsApp,
                    'app',
                    'app.appId = t.appId AND app.clientId = t.clientId'
                )
                qb.leftJoinAndMapOne(
                    't.clientNode',
                    schema.WindowsClient,
                    'client',
                    'client.keyId = t.clientId'
                )
                /**可选筛选条件**/
                if (isNotEmpty(body.clientId)) {
                    qb.andWhere('t.clientId = :clientId', { clientId: body.clientId })
                }
                if (isNotEmpty(body.appId)) {
                    qb.andWhere('t.appId = :appId', { appId: body.appId })
                }
                if (isNotEmpty(body.code)) {
                    qb.andWhere('t.code = :code', { code: body.code })
                }
                if (isNotEmpty(body.status)) {
                    qb.andWhere('t.status = :status', { status: body.status })
                }
                if (isNotEmpty(body.vague)) {
                    qb.andWhere(
                        '(country.cnName LIKE :vague OR country.enName LIKE :vague OR t.code LIKE :vague)',
                        { vague: `%${body.vague}%` }
                    )
                }
                if (isNotEmpty(body.startTime)) {
                    qb.andWhere('t.createTime >= :startTime', { startTime: body.startTime })
                }
                if (isNotEmpty(body.endTime)) {
                    qb.andWhere('t.createTime <= :endTime', { endTime: body.endTime })
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
            throw new HttpException(err.message, err.status ?? HttpStatus.INTERNAL_SERVER_ERROR, err.options)
        }
    }
}
