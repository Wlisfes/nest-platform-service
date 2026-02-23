import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { DataBaseService, WindowsService } from '@/modules/database/database.service'
import { OmixRequest } from '@/interface'
import { isEmpty, isNotEmpty } from 'class-validator'
import { pick } from 'lodash'
import { faker } from '@/utils'
import * as schema from '@/modules/database/schema'
import * as enums from '@/modules/database/enums'
import * as windows from '@web-windows-server/interface'

@Injectable()
export class AccountService extends Logger {
    constructor(private readonly database: DataBaseService, private readonly windows: WindowsService) {
        super()
    }

    /**新增账号**/
    @AutoDescriptor
    public async httpBaseSystemCreateAccount(request: OmixRequest, body: windows.CreateAccountOptions) {
        const ctx = await this.database.transaction()
        try {
            await this.database.builder(this.windows.account, async qb => {
                qb.where(`t.number = :number OR t.phone = :phone`, { number: body.number, phone: body.phone })
                return await qb.getOne().then(async node => {
                    if (isNotEmpty(node) && node.number == body.number) {
                        throw new HttpException(`number:${body.number} 已存在`, HttpStatus.BAD_REQUEST)
                    } else if (isNotEmpty(node) && node.phone == body.phone) {
                        throw new HttpException(`phone:${body.phone} 已存在`, HttpStatus.BAD_REQUEST)
                    }
                    return node
                })
            })
            await this.database.create(ctx.manager.getRepository(schema.WindowsAccount), {
                stack: this.stack,
                request,
                body: body
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
    public async httpBaseSystemColumnAccount(request: OmixRequest, body: windows.ColumnAccountOptions) {
        try {
            return await this.database.builder(this.windows.accountOptions, async qb => {
                qb.leftJoinAndMapMany(
                    't.depts',
                    schema.WindowsDept,
                    'dept',
                    'dept.key_id IN (SELECT da.dept_id FROM tb_windows_dept_account da WHERE da.uid = t.uid)'
                )
                qb.select('t').addSelect(['dept.keyId', 'dept.name', 'dept.alias'])
                if (isNotEmpty(body.name)) {
                    qb.andWhere(`(t.name LIKE :name OR t.number LIKE :number)`, { name: `%${body.name}%`, number: `%${body.name}%` })
                }
                if (isNotEmpty(body.phone)) {
                    qb.andWhere(`t.phone LIKE :phone`, { phone: `%${body.phone}%` })
                }
                if (isNotEmpty(body.email)) {
                    qb.andWhere(`t.email LIKE :email`, { email: `%${body.email}%` })
                }
                if (isNotEmpty(body.status)) {
                    qb.andWhere(`t.status = :status`, { status: body.status })
                }
                if (isNotEmpty(body.depts) && body.depts.length > 0) {
                    qb.andWhere(`EXISTS (SELECT 1 FROM tb_windows_dept_account da WHERE da.uid = t.uid AND da.dept_id IN (:...depts))`, {
                        depts: body.depts
                    })
                }
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

    /**账号详情**/
    @AutoDescriptor
    public async httpBaseSystemAccountResolver(request: OmixRequest, body: windows.AccountPayloadOptions) {
        try {
            return await this.database.builder(this.windows.accountOptions, async qb => {
                qb.leftJoinAndMapMany(
                    't.depts',
                    schema.WindowsDept,
                    'dept',
                    'dept.key_id IN (SELECT da.dept_id FROM tb_windows_dept_account da WHERE da.uid = t.uid)'
                )
                qb.select('t').addSelect(['dept.keyId', 'dept.name', 'dept.alias'])
                qb.where(`t.uid = :uid`, { uid: body.uid })
                return await qb.getOne().then(async node => {
                    if (isEmpty(node)) {
                        throw new HttpException(`uid:${body.uid} 不存在`, HttpStatus.BAD_REQUEST)
                    }
                    return await this.fetchResolver(node)
                })
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        }
    }

    /**编辑账号**/
    @AutoDescriptor
    public async httpBaseSystemUpdateAccount(request: OmixRequest, body: windows.UpdateAccountOptions) {
        const ctx = await this.database.transaction({ schema: ['WindowsAccount', 'WindowsDeptAccount'] })
        try {
            await this.database.empty(this.windows.accountOptions, {
                request,
                message: 'uid:不存在',
                stack: this.stack,
                dispatch: { where: { uid: body.uid } }
            })
            await this.database.builder(this.windows.accountOptions, async qb => {
                qb.where(`(t.number = :number OR t.phone = :phone) AND t.uid != :uid`, {
                    number: body.number,
                    phone: body.phone,
                    uid: body.uid
                })
                return await qb.getOne().then(async node => {
                    if (isNotEmpty(node) && node.number == body.number) {
                        throw new HttpException(`number:${body.number} 已存在`, HttpStatus.BAD_REQUEST)
                    } else if (isNotEmpty(node) && node.phone == body.phone) {
                        throw new HttpException(`phone:${body.phone} 已存在`, HttpStatus.BAD_REQUEST)
                    }
                    return node
                })
            })
            await this.database.update(ctx.WindowsAccount, {
                request,
                stack: this.stack,
                where: { uid: body.uid },
                body: pick(body, ['name', 'phone', 'email', 'status'])
            })
            await this.database.delete(ctx.WindowsDeptAccount, {
                request,
                stack: this.stack,
                where: { uid: body.uid },
                transaction: async node => {
                    return await this.database.insert(ctx.WindowsDeptAccount, {
                        request,
                        stack: this.stack,
                        body: body.depts.map(deptId => ({ deptId, uid: body.uid }))
                    })
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

    /**编辑账号状态**/
    @AutoDescriptor
    public async httpBaseSystemUpdateSwitchAccount(request: OmixRequest, body: windows.UpdateSwitchAccountOptions) {}
}
