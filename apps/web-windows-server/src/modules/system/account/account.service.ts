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
        const ctx = await this.database.transaction({ schema: ['WindowsAccount', 'WindowsPositionAccount'] })
        try {
            await this.database.builder(this.windows.accountOptions, async qb => {
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
            await this.database.create(ctx.WindowsAccount, {
                stack: this.stack,
                request,
                body: body
            }).then(async (node: any) => {
                /**关联职位**/
                if (isNotEmpty(body.positions) && body.positions.length > 0) {
                    await this.database.insert(ctx.WindowsPositionAccount, {
                        request,
                        stack: this.stack,
                        body: body.positions.map(postId => ({ postId, uid: node.uid })) as any
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

    /**分页列表查询**/
    @AutoDescriptor
    public async httpBaseSystemColumnAccount(request: OmixRequest, body: windows.ColumnAccountOptions) {
        try {
            return await this.database.builder(this.windows.accountOptions, async qb => {
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
                    const uids = list.map((item: any) => item.uid)
                    if (uids.length > 0) {
                        /**批量查询归属部门**/
                        const deptRows = await this.database.builder(this.windows.deptAccountOptions, async dqb => {
                            dqb.leftJoinAndMapOne('t.dept', schema.WindowsDept, 'dept', 'dept.key_id = t.deptId')
                            dqb.addSelect(['dept.keyId', 'dept.name', 'dept.alias'])
                            dqb.where(`t.uid IN (:...uids)`, { uids })
                            return await dqb.getMany()
                        })
                        /**批量查询关联职位**/
                        const positionRows = await this.database.builder(this.windows.positionAccountOptions, async pqb => {
                            pqb.leftJoinAndMapOne('t.position', schema.WindowsPosition, 'position', 'position.key_id = t.postId')
                            pqb.addSelect(['position.keyId', 'position.name'])
                            pqb.where(`t.uid IN (:...uids)`, { uids })
                            return await pqb.getMany()
                        })
                        /**批量查询关联角色（直接关联 + 部门角色）**/
                        const deptIds = [...new Set(deptRows.map((r: any) => r.deptId).filter(Boolean))]
                        const roleAccountRows = await this.database.builder(this.windows.roleAccountOptions, async rqb => {
                            rqb.leftJoinAndMapOne('t.role', schema.WindowsRole, 'role', 'role.key_id = t.roleId')
                            rqb.addSelect(['role.keyId', 'role.name'])
                            rqb.where(`t.uid IN (:...uids)`, { uids })
                            return await rqb.getMany()
                        })
                        const deptRoles = deptIds.length > 0
                            ? await this.database.builder(this.windows.roleOptions, async drqb => {
                                drqb.where(`t.deptId IN (:...deptIds)`, { deptIds })
                                return await drqb.getMany()
                            })
                            : []
                        /**组装数据**/
                        list.forEach((item: any) => {
                            item.depts = deptRows.filter((r: any) => r.uid === item.uid).map((r: any) => r.dept).filter(Boolean)
                            item.positions = positionRows.filter((r: any) => r.uid === item.uid).map((r: any) => r.position).filter(Boolean)
                            /**直接关联的角色**/
                            const directRoles = roleAccountRows.filter((r: any) => r.uid === item.uid).map((r: any) => r.role).filter(Boolean)
                            /**部门角色：通过账号的部门ID匹配**/
                            const itemDeptIds = deptRows.filter((r: any) => r.uid === item.uid).map((r: any) => r.deptId)
                            const itemDeptRoles = (deptRoles as any[]).filter((r: any) => itemDeptIds.includes(r.deptId))
                            /**合并去重**/
                            const roleMap = new Map()
                            ;[...directRoles, ...itemDeptRoles].forEach((r: any) => {
                                if (r && !roleMap.has(r.keyId)) roleMap.set(r.keyId, r)
                            })
                            item.roles = [...roleMap.values()]
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
                qb.leftJoinAndMapMany(
                    't.positions',
                    schema.WindowsPosition,
                    'position',
                    'position.key_id IN (SELECT pa.post_id FROM tb_windows_position_account pa WHERE pa.uid = t.uid)'
                )
                qb.select('t').addSelect(['dept.keyId', 'dept.name', 'dept.alias']).addSelect(['position.keyId', 'position.name'])
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
        const ctx = await this.database.transaction({ schema: ['WindowsAccount', 'WindowsDeptAccount', 'WindowsPositionAccount'] })
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
            /**更新关联职位**/
            await this.database.delete(ctx.WindowsPositionAccount, {
                request,
                stack: this.stack,
                where: { uid: body.uid },
                transaction: async node => {
                    if (isNotEmpty(body.positions) && body.positions.length > 0) {
                        return await this.database.insert(ctx.WindowsPositionAccount, {
                            request,
                            stack: this.stack,
                            body: body.positions.map(postId => ({ postId, uid: body.uid }))
                        })
                    }
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
    public async httpBaseSystemUpdateSwitchAccount(request: OmixRequest, body: windows.UpdateSwitchAccountOptions) {
        try {
            const account = await this.database.builder(this.windows.accountOptions, async qb => {
                qb.where(`t.uid = :uid`, { uid: body.uid })
                return await qb.getOne()
            })
            if (isEmpty(account)) {
                throw new HttpException(`uid:${body.uid} 不存在`, HttpStatus.BAD_REQUEST)
            }
            await this.database.update(this.windows.accountOptions, {
                request,
                stack: this.stack,
                where: { uid: body.uid },
                body: { status: body.status }
            })
            return await this.fetchResolver({ message: '操作成功' })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        }
    }

    /**删除账号**/
    @AutoDescriptor
    public async httpBaseSystemDeleteAccount(request: OmixRequest, body: windows.DeleteAccountOptions) {
        const ctx = await this.database.transaction({ schema: ['WindowsAccount', 'WindowsDeptAccount', 'WindowsRoleAccount'] })
        try {
            const account = await this.database.builder(this.windows.accountOptions, async qb => {
                qb.where(`t.uid = :uid`, { uid: body.uid })
                return await qb.getOne()
            })
            if (isEmpty(account)) {
                throw new HttpException(`uid:${body.uid} 不存在`, HttpStatus.BAD_REQUEST)
            }
            // 删除账号关联的部门
            await this.database.delete(ctx.WindowsDeptAccount, {
                request,
                stack: this.stack,
                where: { uid: body.uid }
            })
            // 删除账号关联的角色
            await this.database.delete(ctx.WindowsRoleAccount, {
                request,
                stack: this.stack,
                where: { uid: body.uid }
            })
            // 删除账号
            await this.database.delete(ctx.WindowsAccount, {
                request,
                stack: this.stack,
                where: { uid: body.uid }
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

    /**账号下拉列表**/
    @AutoDescriptor
    public async httpBaseSystemSelectAccount(request: OmixRequest) {
        try {
            return await this.database.builder(this.windows.accountOptions, async qb => {
                qb.where(`t.status = :status`, { status: enums.CHUNK_WINDOWS_ACCOUNT_STATUS.online.value })
                const list = await qb.getMany()
                return await this.fetchResolver({
                    list: list.map(item => ({ value: item.uid, name: `${item.name} ${item.number}` }))
                })
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        }
    }
}
