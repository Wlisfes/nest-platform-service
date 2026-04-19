import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { DataBaseService, WindowsService } from '@/modules/database/database.service'
import { isEmpty, isNotEmpty } from 'class-validator'
import { faker, pick } from '@/utils'
import { OmixRequest } from '@/interface'
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
        const ctx = await this.database.transaction({
            schema: ['WindowsAccount', 'WindowsDeptAccount', 'WindowsPositionAccount', 'WindowsRankAccount']
        })
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
            const node = await this.database.create(ctx.WindowsAccount, {
                comment: `添加新账号`,
                stack: this.stack,
                request,
                body: body
            })
            await this.database.insert(ctx.WindowsDeptAccount, {
                comment: '关联部门',
                next: (body.depts ?? []).length > 0,
                request,
                stack: this.stack,
                body: (body.depts ?? []).map(deptId => ({ deptId, uid: node.uid }))
            })
            await this.database.insert(ctx.WindowsPositionAccount, {
                comment: '关联职位',
                next: (body.positions ?? []).length > 0,
                request,
                stack: this.stack,
                body: (body.positions ?? []).map(postId => ({ postId, uid: node.uid }))
            })
            await this.database.insert(ctx.WindowsRankAccount, {
                next: (body.ranks ?? []).length > 0,
                comment: `关联职级`,
                request,
                stack: this.stack,
                body: (body.ranks ?? []).map(rankId => ({ rankId, uid: node.uid }))
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
                qb.orderBy('t.createTime', 'DESC')
                qb.skip((body.page - 1) * body.size)
                qb.take(body.size)
                return await qb.getManyAndCount().then(async ([list, total]) => {
                    const uids = list.map((item: any) => item.uid)
                    if (uids.length > 0) {
                        /**并行批量查询关联数据**/
                        const [deptRows, positionRows, rankRows, roleAccountRows] = await Promise.all([
                            /**批量查询归属部门**/
                            this.database.builder(this.windows.deptAccountOptions, async dqb => {
                                dqb.leftJoinAndMapOne('t.dept', schema.WindowsDept, 'dept', 'dept.key_id = t.deptId')
                                dqb.addSelect(['dept.keyId', 'dept.name', 'dept.alias', 'dept.pid'])
                                dqb.where(`t.uid IN (:...uids)`, { uids })
                                return await dqb.getMany()
                            }),
                            /**批量查询关联职位**/
                            this.database.builder(this.windows.positionAccountOptions, async pqb => {
                                pqb.leftJoinAndMapOne('t.position', schema.WindowsPosition, 'position', 'position.key_id = t.postId')
                                pqb.addSelect(['position.keyId', 'position.name'])
                                pqb.where(`t.uid IN (:...uids)`, { uids })
                                return await pqb.getMany()
                            }),
                            /**批量查询关联职级**/
                            this.database.builder(this.windows.rankAccountOptions, async rkqb => {
                                rkqb.leftJoinAndMapOne('t.rank', schema.WindowsRank, 'rank', 'rank.key_id = t.rankId')
                                rkqb.addSelect(['rank.keyId', 'rank.name', 'rank.chunk'])
                                rkqb.where(`t.uid IN (:...uids)`, { uids })
                                return await rkqb.getMany()
                            }),
                            /**批量查询直接关联角色**/
                            this.database.builder(this.windows.roleAccountOptions, async rqb => {
                                rqb.leftJoinAndMapOne('t.role', schema.WindowsRole, 'role', 'role.key_id = t.roleId')
                                rqb.addSelect(['role.keyId', 'role.name', 'role.chunk', 'role.deptId', 'role.model'])
                                rqb.where(`t.uid IN (:...uids)`, { uids })
                                return await rqb.getMany()
                            })
                        ])
                        /**批量查询部门角色**/
                        const deptIds = [...new Set(deptRows.map((r: Omix) => r.deptId).filter(Boolean))]
                        const deptRoles = await this.database.builder(this.windows.roleOptions, async drqb => {
                            if (deptIds.length === 0) return []
                            drqb.where(`t.deptId IN (:...deptIds)`, { deptIds })
                            return await drqb.getMany()
                        })
                        /**组装数据**/
                        list.forEach((item: Omix) => {
                            item.depts = deptRows.flatMap((r: Omix) => (r.uid === item.uid && r.dept ? [r.dept] : []))
                            item.positions = positionRows.flatMap((r: Omix) => (r.uid === item.uid && r.position ? [r.position] : []))
                            item.ranks = rankRows.flatMap((r: Omix) => (r.uid === item.uid && r.rank ? [r.rank] : []))
                            /**直接关联的角色**/
                            const directRoles = roleAccountRows.flatMap((r: Omix) => (r.uid === item.uid && r.role ? [r.role] : []))
                            /**部门角色：通过账号的部门ID匹配**/
                            const itemDeptIds = deptRows.filter((r: Omix) => r.uid === item.uid).map((r: Omix) => r.deptId)
                            const itemDeptRoles = deptRoles.filter((r: Omix) => itemDeptIds.includes(r.deptId))
                            /**合并去重**/
                            const roleMap = new Map()
                            ;[...directRoles, ...itemDeptRoles].forEach((r: Omix) => {
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
                qb.leftJoinAndMapMany(
                    't.ranks',
                    schema.WindowsRank,
                    'rank',
                    'rank.key_id IN (SELECT ra.rank_id FROM tb_windows_rank_account ra WHERE ra.uid = t.uid)'
                )
                qb.select('t')
                    .addSelect(['dept.keyId', 'dept.name', 'dept.alias'])
                    .addSelect(['position.keyId', 'position.name'])
                    .addSelect(['rank.keyId', 'rank.name', 'rank.chunk'])
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
        const ctx = await this.database.transaction({
            schema: ['WindowsAccount', 'WindowsDeptAccount', 'WindowsPositionAccount', 'WindowsRankAccount']
        })
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
                comment: '更新账号信息',
                request,
                stack: this.stack,
                where: { uid: body.uid },
                body: pick(body, ['name', 'phone', 'email', 'avatar', 'status'])
            })
            /**更新关联部门**/
            await this.database.delete(ctx.WindowsDeptAccount, {
                comment: '清除旧部门关联',
                request,
                stack: this.stack,
                where: { uid: body.uid },
                transaction: async node => {
                    return await this.database.insert(ctx.WindowsDeptAccount, {
                        comment: '关联部门',
                        next: (body.depts ?? []).length > 0,
                        request,
                        stack: this.stack,
                        body: body.depts.map(deptId => ({ deptId, uid: body.uid }))
                    })
                }
            })
            /**更新关联职位**/
            await this.database.delete(ctx.WindowsPositionAccount, {
                comment: '清除旧职位关联',
                request,
                stack: this.stack,
                where: { uid: body.uid },
                transaction: async node => {
                    return await this.database.insert(ctx.WindowsPositionAccount, {
                        comment: '关联职位',
                        next: (body.positions ?? []).length > 0,
                        request,
                        stack: this.stack,
                        body: (body.positions ?? []).map(postId => ({ postId, uid: body.uid }))
                    })
                }
            })
            /**更新关联职级**/
            await this.database.delete(ctx.WindowsRankAccount, {
                comment: '清除旧职级关联',
                request,
                stack: this.stack,
                where: { uid: body.uid },
                transaction: async node => {
                    return await this.database.insert(ctx.WindowsRankAccount, {
                        comment: '关联职级',
                        next: (body.ranks ?? []).length > 0,
                        request,
                        stack: this.stack,
                        body: (body.ranks ?? []).map(rankId => ({ rankId, uid: body.uid }))
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
                qb.where(`t.status = :status`, { status: enums.CHUNK_ACCOUNT_STATUS.online.value })
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
