import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { DataBaseService, WindowsService, schema, enums } from '@/modules/database/database.service'
import { fetchHandler, isEmpty, isNotEmpty } from '@/utils'
import { OmixRequest } from '@/interface'
import { Not, In } from 'typeorm'
import * as windows from '@web-windows-server/interface'

@Injectable()
export class PositionService extends Logger {
    constructor(private readonly database: DataBaseService, private readonly windows: WindowsService) {
        super()
    }

    /**新增职位**/
    @AutoDescriptor
    public async httpBaseSystemCreatePosition(request: OmixRequest, body: windows.CreatePositionOptions) {
        const ctx = await this.database.transaction()
        try {
            /**验证名称是否重复**/
            const exist = await this.database.builder(this.windows.positionOptions, async qb => {
                qb.where(`t.name = :name`, { name: body.name })
                return await qb.getOne()
            })
            if (isNotEmpty(exist)) {
                throw new HttpException('职位名称已存在', HttpStatus.BAD_REQUEST)
            }
            const node = ctx.manager.getRepository(schema.WindowsPosition).create({
                name: body.name,
                sort: body.sort ?? 0,
                createBy: request.user.uid,
                modifyBy: request.user.uid
            })
            await ctx.manager.getRepository(schema.WindowsPosition).save(node)
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

    /**编辑职位**/
    @AutoDescriptor
    public async httpBaseSystemUpdatePosition(request: OmixRequest, body: windows.UpdatePositionOptions) {
        const ctx = await this.database.transaction()
        try {
            /**验证职位存在**/
            await this.database.empty(this.windows.positionOptions, {
                request,
                message: 'keyId:不存在',
                dispatch: { where: { keyId: body.keyId } }
            })
            /**验证名称是否重复**/
            const exist = await this.database.builder(this.windows.positionOptions, async qb => {
                qb.where(`t.name = :name AND t.keyId != :keyId`, { name: body.name, keyId: body.keyId })
                return await qb.getOne()
            })
            if (isNotEmpty(exist)) {
                throw new HttpException('职位名称已存在', HttpStatus.BAD_REQUEST)
            }
            await this.database.update(ctx.manager.getRepository(schema.WindowsPosition), {
                request,
                stack: this.stack,
                where: { keyId: body.keyId },
                body: { name: body.name, sort: body.sort ?? 0 }
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

    /**职位详情**/
    @AutoDescriptor
    public async httpBaseSystemPositionResolver(request: OmixRequest, body: windows.PositionPayloadOptions) {
        try {
            return await this.database.empty(this.windows.positionOptions, {
                request,
                message: 'keyId:不存在',
                dispatch: { where: { keyId: body.keyId } }
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        }
    }

    /**分页列表查询**/
    @AutoDescriptor
    public async httpBaseSystemColumnPosition(request: OmixRequest, body: windows.ColumnPositionOptions) {
        try {
            return await this.database.builder(this.windows.positionOptions, async qb => {
                qb.leftJoinAndMapOne('t.createBy', schema.WindowsAccount, 'createBy', 'createBy.uid = t.createBy')
                qb.leftJoinAndMapOne('t.modifyBy', schema.WindowsAccount, 'modifyBy', 'modifyBy.uid = t.modifyBy')
                if (isNotEmpty(body.name)) {
                    qb.where(`t.name LIKE :name`, { name: `%${body.name}%` })
                }
                qb.orderBy('t.sort', 'ASC')
                qb.skip((body.page - 1) * body.size)
                qb.take(body.size)
                return await qb.getManyAndCount().then(async ([list, total]) => {
                    /**查询关联账号数量**/
                    const positionIds = list.map((item: any) => item.keyId)
                    if (positionIds.length > 0) {
                        const accountCounts = await this.database.builder(this.windows.positionAccountOptions, async cqb => {
                            cqb.select('t.postId', 'postId')
                            cqb.addSelect('COUNT(*)', 'count')
                            cqb.where(`t.postId IN (:...positionIds)`, { positionIds })
                            cqb.groupBy('t.postId')
                            return await cqb.getRawMany()
                        })
                        list.forEach((item: any) => {
                            item.accountCount = Number(accountCounts.find((c: any) => c.postId === item.keyId)?.count ?? 0)
                        })
                    }
                    return await this.fetchResolver({ page: body.page, size: body.size, total, list })
                })
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        }
    }

    /**删除职位**/
    @AutoDescriptor
    public async httpBaseSystemDeletePosition(request: OmixRequest, body: windows.DeletePositionOptions) {
        const ctx = await this.database.transaction()
        try {
            /**验证职位存在**/
            await this.database.empty(this.windows.positionOptions, {
                request,
                message: 'keyId:不存在',
                dispatch: { where: { keyId: body.keyId } }
            })
            /**删除职位关联的账号关系**/
            await ctx.manager.getRepository(schema.WindowsPositionAccount).delete({ postId: body.keyId })
            /**删除职位**/
            await ctx.manager.getRepository(schema.WindowsPosition).delete({ keyId: body.keyId })
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

    /**职位下拉列表**/
    @AutoDescriptor
    public async httpBaseSystemSelectPosition(request: OmixRequest) {
        try {
            return await this.database.builder(this.windows.positionOptions, async qb => {
                qb.orderBy('t.sort', 'ASC')
                const list = await qb.getMany()
                return await this.fetchResolver({
                    list: list.map(item => ({ value: item.keyId, name: item.name }))
                })
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        }
    }
}
