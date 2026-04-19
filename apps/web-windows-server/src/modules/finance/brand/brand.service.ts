import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { DataBaseService, WindowsService, schema, enums } from '@/modules/database/database.service'
import { isNotEmpty } from '@/utils'
import { OmixRequest } from '@/interface'
import * as windows from '@web-windows-server/interface'

@Injectable()
export class FinanceBrandService extends Logger {
    constructor(private readonly database: DataBaseService, private readonly windows: WindowsService) {
        super()
    }

    /**新增品牌**/
    @AutoDescriptor
    public async httpBaseFinanceCreateBrand(request: OmixRequest, body: windows.CreateBrandOptions) {
        const ctx = await this.database.transaction()
        try {
            /**验证品牌存在**/
            await this.database.notempty(this.windows.brandOptions, {
                request,
                message: '品牌名称已存在',
                dispatch: { where: { name: body.name } }
            })
            const node = ctx.manager.getRepository(schema.WindowsBrand).create({
                name: body.name,
                document: body.document,
                status: body.status ?? enums.CHUNK_BRAND_STATUS.enable.value,
                createBy: request.user.uid,
                modifyBy: request.user.uid
            })
            await ctx.manager.getRepository(schema.WindowsBrand).save(node)
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

    /**编辑品牌**/
    @AutoDescriptor
    public async httpBaseFinanceUpdateBrand(request: OmixRequest, body: windows.UpdateBrandOptions) {
        const ctx = await this.database.transaction()
        try {
            /**验证品牌不存在**/
            await this.database.empty(this.windows.brandOptions, {
                request,
                message: 'keyId:不存在',
                dispatch: { where: { keyId: body.keyId } }
            })
            /**验证名称是否重复**/
            const exist = await this.database.builder(this.windows.brandOptions, async qb => {
                qb.where(`t.name = :name AND t.keyId != :keyId`, { name: body.name, keyId: body.keyId })
                return await qb.getOne()
            })
            if (isNotEmpty(exist)) {
                throw new HttpException('品牌名称已存在', HttpStatus.BAD_REQUEST)
            }
            await this.database.update(ctx.manager.getRepository(schema.WindowsBrand), {
                request,
                stack: this.stack,
                where: { keyId: body.keyId },
                body: { name: body.name, document: body.document }
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
    public async httpBaseFinanceColumnBrand(request: OmixRequest, body: windows.ColumnBrandOptions) {
        try {
            return await this.database.builder(this.windows.brandOptions, async qb => {
                qb.leftJoinAndMapOne('t.createBy', schema.WindowsAccount, 'createBy', 'createBy.uid = t.createBy')
                qb.leftJoinAndMapOne('t.modifyBy', schema.WindowsAccount, 'modifyBy', 'modifyBy.uid = t.modifyBy')
                if (isNotEmpty(body.name)) {
                    qb.andWhere(`t.name LIKE :name`, { name: `%${body.name}%` })
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
    public async httpBaseFinanceUpdateBrandStatus(request: OmixRequest, body: windows.UpdateBrandStatusOptions) {
        const ctx = await this.database.transaction()
        try {
            /**验证品牌存在**/
            await this.database.empty(this.windows.brandOptions, {
                request,
                message: 'keyId:不存在',
                dispatch: { where: { keyId: body.keyId } }
            })
            await this.database.update(ctx.manager.getRepository(schema.WindowsBrand), {
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

    /**品牌下拉列表（启用状态）**/
    @AutoDescriptor
    public async httpBaseFinanceSelectBrand(request: OmixRequest) {
        try {
            return await this.database.builder(this.windows.brandOptions, async qb => {
                qb.andWhere(`t.status = :status`, { status: enums.CHUNK_BRAND_STATUS.enable.value })
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
