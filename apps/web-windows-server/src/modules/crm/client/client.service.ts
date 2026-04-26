import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
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

    /**新增客户**/
    @AutoDescriptor
    public async httpBaseCrmClientCommonCreate(request: OmixRequest, body: windows.BaseCrmClientCommonCreateOptions) {
        const ctx = await this.database.transaction()
        try {
            const node = await this.database.create(ctx.manager.getRepository(schema.WindowsClient), {
                request,
                stack: this.stack,
                body: {
                    userId: request.user.uid,
                    name: body.name,
                    alias: body.alias,
                    brandId: body.brandId,
                    currency: body.currency,
                    email: body.email,
                    phone: body.phone,
                    status: body.status ?? enums.CHUNK_CLIENT_STATUS.enable.value,
                    payMode: body.payMode,
                    authStatus: body.authStatus ?? enums.CHUNK_CLIENT_AUTH_STATUS.unverified.value,
                    source: body.source ?? enums.CHUNK_CLIENT_SOURCE.manual.value,
                    remark: body.remark
                }
            })
            await this.database.create(ctx.manager.getRepository(schema.WindowsClientSettings), {
                request,
                stack: this.stack,
                body: { clientId: node.keyId }
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
                        item.user = accounts.find(e => e.uid === item.userId)
                        item.brand = brands.find(e => e.keyId === item.brandId)
                        item.depts = depts.filter((e: Omix) => e.uid === item.userId)
                    })
                    return await this.fetchResolver({ page: body.page, size: body.size, total, list })
                })
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        }
    }

    /**客户详情**/
    @AutoDescriptor
    public async httpBaseCrmClientResolver(request: OmixRequest, body: windows.BaseCrmClientResolverOptions) {
        try {
            return await this.database.builder(this.windows.clientOptions, async qb => {
                qb.leftJoinAndMapMany('t.tags', schema.WindowsClientTags, 'tags', 'tags.clientId = t.keyId')
                qb.where(`t.keyId = :keyId`, { keyId: body.keyId })
                return await qb.getOne().then(async node => {
                    if (!node) {
                        throw new HttpException(`keyId:${body.keyId} 不存在`, HttpStatus.BAD_REQUEST)
                    }
                    const [depts, accounts, brands] = await Promise.all([
                        this.deptUtilsService.fetchUtilsUidByColumnDepartment(request, {
                            uids: [node.userId]
                        }),
                        this.accountUtilsService.fetchUtilsUidByColumnAccount(request, {
                            uids: [node.userId],
                            fields: ['uid', 'name', 'number', 'status', 'avatar']
                        }),
                        this.brandUtilsService.fetchUtilsUidByColumnBrand(request, {
                            keyIds: [node.brandId],
                            fields: ['name', 'document', 'status']
                        })
                    ])
                    const item: Omix = node
                    item.user = accounts.find(e => e.uid === node.userId)
                    item.brand = brands.find(e => e.keyId === node.brandId)
                    item.depts = depts.filter((e: Omix) => e.uid === node.userId)
                    return await this.fetchResolver(item)
                })
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        }
    }
}
