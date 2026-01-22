import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { In } from 'typeorm'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { DataBaseService, WindowsService, schema, enums } from '@/modules/database/database.service'
import { RedisService } from '@/modules/redis/redis.service'
import { OmixRequest } from '@/interface'
import { isNotEmpty } from 'class-validator'
import { fetchHandler } from '@/utils'
import * as windows from '@web-windows-server/interface'

@Injectable()
export class RoleService extends Logger {
    constructor(
        private readonly database: DataBaseService,
        private readonly windows: WindowsService,
        private readonly redis: RedisService
    ) {
        super()
    }

    private async clearUserPermissionsCache(request: OmixRequest, uids: string[]) {
        await Promise.all(
            (uids ?? []).filter(Boolean).map(async uid => {
                try {
                    const key = await this.redis.compose(request, 'windows:permissions:{uid}', { uid })
                    await this.redis.delStore(request, { key, logger: false })
                } catch (err) {
                    this.logger.error(err)
                }
            })
        )
    }

    /**新增角色**/
    @AutoDescriptor
    public async httpBaseSystemCreateRole(request: OmixRequest, body: windows.CreateRoleOptions) {
        const ctx = await this.database.transaction()
        try {
            await this.database.builder(this.windows.role, async qb => {
                qb.where(`t.name = :name`, { name: body.name })
                await qb.getOne().then(async node => {
                    if (isNotEmpty(node)) {
                        throw new HttpException(`name:${body.name} 已存在`, HttpStatus.BAD_REQUEST)
                    }
                    return node
                })
            })

            const model = body.model ?? enums.COMMON_WINDOWS_ROLE.model.self.value
            const sort = body.sort ?? 0
            await this.database.create(ctx.manager.getRepository(schema.WindowsRole), {
                request,
                stack: this.stack,
                body: Object.assign(body, { model, sort, createBy: request.user.uid })
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

    /**编辑角色**/
    @AutoDescriptor
    public async httpBaseSystemUpdateRole(request: OmixRequest, body: windows.UpdateRoleOptions) {
        const ctx = await this.database.transaction()
        try {
            await this.database.empty(this.windows.role, {
                request,
                message: 'keyId不存在',
                dispatch: { where: { keyId: body.keyId } }
            })

            await this.database.builder(this.windows.role, async qb => {
                qb.where(`t.name = :name`, { name: body.name })
                await qb.getOne().then(async node => {
                    if (isNotEmpty(node) && node.keyId !== body.keyId) {
                        throw new HttpException(`name:${body.name} 已存在`, HttpStatus.BAD_REQUEST)
                    }
                    return node
                })
            })

            await this.database.update(ctx.manager.getRepository(schema.WindowsRole), {
                request,
                stack: this.stack,
                where: { keyId: body.keyId },
                body: Object.assign(body, { modifyBy: request.user.uid })
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

    /**角色详情**/
    @AutoDescriptor
    public async httpBaseSystemResolverRole(request: OmixRequest, body: windows.RoleResolverOptions) {
        try {
            return await this.database.empty(this.windows.role, {
                request,
                message: 'keyId不存在',
                dispatch: { where: { keyId: body.keyId } }
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        }
    }

    /**角色列表**/
    @AutoDescriptor
    public async httpBaseSystemColumnRole(request: OmixRequest, body: windows.ColumnRoleOptions) {
        try {
            return await this.database.builder(this.windows.role, async qb => {
                qb.skip((body.page - 1) * body.size)
                qb.take(body.size)
                await fetchHandler(isNotEmpty(body.vague), async () => {
                    qb.andWhere(`t.name like :vague`, { vague: `%${body.vague}%` })
                })
                await fetchHandler(isNotEmpty(body.model), async () => {
                    qb.andWhere(`t.model = :model`, { model: body.model })
                })
                return await qb.getManyAndCount().then(async ([list, total]) => {
                    return await this.fetchResolver({ list, total })
                })
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        }
    }

    /**删除角色**/
    @AutoDescriptor
    public async httpBaseSystemDeleteRole(request: OmixRequest, body: windows.DeleteRoleOptions) {
        const ctx = await this.database.transaction()
        try {
            const keys = body.keys ?? []
            if (keys.length === 0) {
                throw new HttpException('keys 必填', HttpStatus.BAD_REQUEST)
            }
            const repo = ctx.manager.getRepository(schema.WindowsRole)
            const roles = await repo.find({ where: { keyId: In(keys) } })
            if (roles.length !== keys.length) {
                const exists = new Set(roles.map(r => r.keyId))
                const miss = keys.filter(id => !exists.has(id))
                throw new HttpException(`keyId不存在:${miss.join(',')}`, HttpStatus.BAD_REQUEST)
            }

            const roleUids = await ctx.manager
                .getRepository(schema.WindowsRoleAccount)
                .find({ where: { roleId: In(keys) } })
                .then(list => list.map(it => it.uid))

            await ctx.manager.getRepository(schema.WindowsRoleResource).delete({ roleId: In(keys) })
            await ctx.manager.getRepository(schema.WindowsRoleSheet).delete({ roleId: In(keys) })
            await ctx.manager.getRepository(schema.WindowsRoleApifox).delete({ roleId: In(keys) })
            await ctx.manager.getRepository(schema.WindowsRoleAccount).delete({ roleId: In(keys) })
            await repo.delete({ keyId: In(keys) })

            return await ctx.commitTransaction().then(async () => {
                await this.clearUserPermissionsCache(request, roleUids)
                return await this.fetchResolver({ message: '操作成功' })
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        } finally {
            await ctx.release()
        }
    }

    /**角色授权**/
    @AutoDescriptor
    public async httpBaseSystemGrantRole(request: OmixRequest, body: windows.GrantRoleOptions) {
        const ctx = await this.database.transaction()
        try {
            await this.database.empty(this.windows.role, {
                request,
                message: 'roleId 不存在',
                dispatch: { where: { keyId: body.roleId } }
            })

            const resourceIds = Array.from(new Set(body.resourceIds ?? []))
            const sheetIds = Array.from(new Set(body.sheetIds ?? []))
            const apifoxIds = Array.from(new Set(body.apifoxIds ?? []))

            await fetchHandler(resourceIds.length > 0, async () => {
                const nodes = await ctx.manager.getRepository(schema.WindowsResource).find({ where: { keyId: In(resourceIds) } })
                if (nodes.length !== resourceIds.length) {
                    const exists = new Set(nodes.map(n => n.keyId))
                    const miss = resourceIds.filter(id => !exists.has(id))
                    throw new HttpException(`resourceIds不存在:${miss.join(',')}`, HttpStatus.BAD_REQUEST)
                }
            })

            await fetchHandler(sheetIds.length > 0, async () => {
                const nodes = await ctx.manager.getRepository(schema.WindowsResourceSheet).find({ where: { keyId: In(sheetIds) } })
                if (nodes.length !== sheetIds.length) {
                    const exists = new Set(nodes.map(n => n.keyId))
                    const miss = sheetIds.filter(id => !exists.has(id))
                    throw new HttpException(`sheetIds不存在:${miss.join(',')}`, HttpStatus.BAD_REQUEST)
                }
            })

            await fetchHandler(apifoxIds.length > 0, async () => {
                const nodes = await ctx.manager.getRepository(schema.WindowsResourceApifox).find({ where: { keyId: In(apifoxIds) } })
                if (nodes.length !== apifoxIds.length) {
                    const exists = new Set(nodes.map(n => n.keyId))
                    const miss = apifoxIds.filter(id => !exists.has(id))
                    throw new HttpException(`apifoxIds不存在:${miss.join(',')}`, HttpStatus.BAD_REQUEST)
                }
            })

            const uid = request.user.uid
            await ctx.manager.getRepository(schema.WindowsRoleResource).delete({ roleId: body.roleId })
            await ctx.manager.getRepository(schema.WindowsRoleSheet).delete({ roleId: body.roleId })
            await ctx.manager.getRepository(schema.WindowsRoleApifox).delete({ roleId: body.roleId })

            await fetchHandler(resourceIds.length > 0, async () => {
                await ctx.manager
                    .getRepository(schema.WindowsRoleResource)
                    .save(resourceIds.map(sid => ({ roleId: body.roleId, sid, createBy: uid, modifyBy: uid })))
            })

            await fetchHandler(sheetIds.length > 0, async () => {
                await ctx.manager
                    .getRepository(schema.WindowsRoleSheet)
                    .save(sheetIds.map(sheetId => ({ roleId: body.roleId, sheetId, createBy: uid, modifyBy: uid })))
            })

            await fetchHandler(apifoxIds.length > 0, async () => {
                await ctx.manager
                    .getRepository(schema.WindowsRoleApifox)
                    .save(apifoxIds.map(apifoxId => ({ roleId: body.roleId, apifoxId, createBy: uid, modifyBy: uid })))
            })

            const roleUids = await ctx.manager
                .getRepository(schema.WindowsRoleAccount)
                .find({ where: { roleId: body.roleId } })
                .then(list => list.map(it => it.uid))

            return await ctx.commitTransaction().then(async () => {
                await this.clearUserPermissionsCache(request, roleUids)
                return await this.fetchResolver({ message: '操作成功' })
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        } finally {
            await ctx.release()
        }
    }

    /**查询角色已授权权限**/
    @AutoDescriptor
    public async httpBaseSystemRolePermissions(request: OmixRequest, body: windows.RolePermissionsOptions) {
        try {
            await this.database.empty(this.windows.role, {
                request,
                message: 'roleId 不存在',
                dispatch: { where: { keyId: body.roleId } }
            })

            const [resources, sheets, apifox] = await Promise.all([
                this.windows.roleResource.find({ where: { roleId: body.roleId } }),
                this.windows.roleSheet.find({ where: { roleId: body.roleId } }),
                this.windows.roleApifox.find({ where: { roleId: body.roleId } })
            ])

            return await this.fetchResolver({
                resourceIds: resources.map(r => r.sid),
                sheetIds: sheets.map(s => s.sheetId),
                apifoxIds: apifox.map(a => a.apifoxId)
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        }
    }
}
