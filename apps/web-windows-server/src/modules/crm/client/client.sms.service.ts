import { Injectable, HttpException } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { DataBaseService, SmsService, WindowsService, enums } from '@/modules/database/database.service'
import { CrmClientUtilsService } from '@web-windows-server/modules/crm/client/client.utils.service'
import { DeployDeptScopeService } from '@web-windows-server/modules/deploy/dept/dept.scope.service'
import { isNotEmpty, fetchIntNumber } from '@/utils'
import { OmixRequest } from '@/interface'
import * as windows from '@web-windows-server/interface'

@Injectable()
export class CrmClientSmsService extends Logger {
    constructor(
        private readonly database: DataBaseService,
        private readonly smsService: SmsService,
        private readonly windows: WindowsService,
        private readonly crmClientUtilsService: CrmClientUtilsService,
        private readonly deptScopeService: DeployDeptScopeService
    ) {
        super()
    }

    /**客户短信应用分页列表**/
    @AutoDescriptor
    public async httpBaseCrmClientSmsColumn(request: OmixRequest, body: windows.BaseCrmClientSmsColumnOptions) {
        try {
            /**验证客户存在**/
            await this.database.empty(this.windows.clientOptions, {
                request,
                message: '客户不存在',
                dispatch: { where: { keyId: body.clientId } }
            })
            return await this.database.builder(this.smsService.tbSmsAppOptions, async qb => {
                qb.where(`t.clientId = :clientId`, { clientId: body.clientId })
                if (isNotEmpty(body.status)) {
                    qb.andWhere(`t.status = :status`, { status: body.status })
                }
                if (isNotEmpty(body.type)) {
                    qb.andWhere(`t.type = :type`, { type: body.type })
                }
                if (isNotEmpty(body.appAlias)) {
                    qb.andWhere(`t.appAlias LIKE :appAlias`, { appAlias: `%${body.appAlias}%` })
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

    /**新增客户短信应用**/
    @AutoDescriptor
    public async httpBaseCrmClientSmsCreate(request: OmixRequest, body: windows.BaseCrmClientSmsCreateOptions) {
        try {
            const alias = await this.crmClientUtilsService.fetchUtilsNewClientSmsAlias(request, {
                clientId: body.clientId,
                type: body.type
            })
            return await fetchIntNumber({ bit: 8 }).then(async appId => {
                await this.database.create(this.smsService.tbSmsAppOptions, {
                    request,
                    stack: this.stack,
                    body: {
                        userId: request.user.uid,
                        clientId: body.clientId,
                        appId: appId,
                        appAlias: alias,
                        type: body.type,
                        pushUrl: body.pushUrl,
                        remark: body.remark,
                        status: enums.CHUNK_CLIENT_SMS_STATUS.inactive.value,
                        appName: require('crypto').randomBytes(4).toString('hex')
                    }
                })
                return await this.fetchResolver({ message: '操作成功', alias })
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        }
    }

    /**客户短信应用下拉列表**/
    @AutoDescriptor
    public async httpBaseCrmClientSmsSelect(request: OmixRequest, body: windows.BaseCrmClientSmsSelectOptions) {
        try {
            /**解析当前用户的数据权限范围**/
            const { userIds } = await this.deptScopeService.fetchDataScopeUserIds(request)
            return await this.database.builder(this.smsService.tbSmsAppOptions, async qb => {
                qb.select(['t.type', 't.appAlias', 't.appId', 't.appName', 't.clientId'])
                qb.where(`t.clientId = :clientId`, { clientId: body.clientId })
                /**根据数据权限过滤：userIds为空数组表示全部可见，非空则按列表过滤**/
                if (userIds.length > 0) {
                    qb.andWhere(`t.userId IN (:...userIds)`, { userIds })
                }
                qb.orderBy('t.createTime', 'DESC')
                return await qb.getMany().then(async list => {
                    return await this.fetchResolver({ list })
                })
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        }
    }
}
