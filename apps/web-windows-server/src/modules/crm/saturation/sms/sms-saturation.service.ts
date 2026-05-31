import { Injectable } from '@nestjs/common'
import { HttpException, HttpStatus } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { DataBaseService, SmsService, WindowsService, schema, enums } from '@/modules/database/database.service'
import { isNotEmpty, fetchAmountRestore } from '@/utils'
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
                qb.leftJoinAndMapOne('t.mccOptions', schema.WindowsCountry, 'mccOptions', 'mccOptions.code = t.code')
                qb.leftJoinAndMapOne('t.appOptions', schema.TbSmsApp, 'appOptions', 'appOptions.appId = t.appId')
                qb.leftJoinAndMapOne('t.clientOptions', schema.WindowsClient, 'clientOptions', 'clientOptions.keyId = t.clientId')
                if (isNotEmpty(body.clientId)) {
                    qb.andWhere('t.clientId = :clientId OR clientOptions.name LIKE :clientId', { clientId: body.clientId })
                }
                if (isNotEmpty(body.alias)) {
                    qb.andWhere('clientOptions.alias LIKE :alias', { alias: `%${body.alias}%` })
                }
                if (isNotEmpty(body.appId)) {
                    qb.andWhere('t.appId = :appId', { appId: body.appId })
                }
                if (isNotEmpty(body.appAlias)) {
                    qb.andWhere('appOptions.appAlias LIKE :appAlias', { appAlias: `%${body.appAlias}%` })
                }
                if (isNotEmpty(body.code)) {
                    qb.andWhere('t.code = :code', { code: body.code })
                }
                if (isNotEmpty(body.mcc)) {
                    qb.andWhere('t.mcc = :mcc', { mcc: body.mcc })
                }
                if (isNotEmpty(body.status)) {
                    qb.andWhere('t.status = :status', { status: body.status })
                }
                if (isNotEmpty(body.startTime)) {
                    qb.andWhere('t.effectiveTime >= :startTime', { startTime: body.startTime })
                }
                if (isNotEmpty(body.endTime)) {
                    qb.andWhere('t.effectiveTime <= :endTime', { endTime: body.endTime })
                }
                qb.orderBy('t.createTime', 'DESC')
                qb.skip((body.page - 1) * body.size)
                qb.take(body.size)
                return await qb.getManyAndCount().then(async ([list, total]) => {
                    const data = list.map((item: Omix) => ({
                        ...item,
                        upUsd: fetchAmountRestore(item.upUsd),
                        downUsd: fetchAmountRestore(item.downUsd),
                        upLocal: fetchAmountRestore(item.upLocal),
                        downLocal: fetchAmountRestore(item.downLocal)
                    }))
                    return await this.fetchResolver({ page: body.page, size: body.size, total, list: data })
                })
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status ?? HttpStatus.INTERNAL_SERVER_ERROR, err.options)
        }
    }
}
