import { Injectable, HttpException } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { DeployDeptUtilsService } from '@web-windows-server/modules/deploy/dept/dept.utils.service'
import { FinanceBrandUtilsService } from '@web-windows-server/modules/finance/brand/brand.utils.service'
import { DeployAccountUtilsService } from '@web-windows-server/modules/deploy/account/account.utils.service'
import { DataBaseService, WindowsService, schema, enums } from '@/modules/database/database.service'
import { isNotEmpty } from '@/utils'
import { OmixRequest } from '@/interface'
import * as windows from '@web-windows-server/interface'

@Injectable()
export class CrmClientService extends Logger {
    constructor(
        private readonly database: DataBaseService,
        private readonly windows: WindowsService,
        private readonly deptUtilsService: DeployDeptUtilsService,
        private readonly brandUtilsService: FinanceBrandUtilsService,
        private readonly accountUtilsService: DeployAccountUtilsService
    ) {
        super()
    }

    /**分页列表查询**/
    @AutoDescriptor
    public async httpBaseCrmClientCommonConsumer(request: OmixRequest, body: windows.BaseCrmClientCommonConsumerOptions) {
        try {
            return await this.database.builder(this.windows.clientOptions, async qb => {
                qb.leftJoinAndMapMany('t.tags', schema.WindowsClientTags, 'tags', 'tags.clientId = t.keyId')
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
                    const [depts, accounts, brands] = await Promise.all([
                        this.deptUtilsService.fetchUtilsUidByColumnDepartment(request, {
                            uids: list.map(item => item.userId)
                        }),
                        this.accountUtilsService.fetchUtilsUidByColumnAccount(request, {
                            uids: list.map(item => item.userId),
                            fields: ['uid', 'name', 'number', 'status', 'avatar']
                        }),
                        this.brandUtilsService.fetchUtilsUidByColumnBrand(request, {
                            keyIds: list.map(item => item.brandId),
                            fields: ['name', 'document', 'status']
                        })
                    ])
                    list.forEach((item: Omix) => {
                        item.chunkUser = accounts.find(e => e.uid === item.userId)
                        item.chunkBrand = brands.find(e => e.keyId === item.brandId)
                        item.chunkDepts = depts.filter((e: Omix) => e.uid === item.userId)
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
