import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Not } from 'typeorm'
import { Logger, AutoMethodDescriptor } from '@/modules/logger/logger.service'
import { DatabaseService } from '@/modules/database/database.service'
import { Omix, OmixRequest, OmixBaseOptions } from '@/interface/instance.resolver'
import { fetchHandler, fetchIntNumber, isNotEmpty, fetchTreeNodeDelete, tree } from '@/utils/utils-common'
import * as field from '@web-system-service/interface/instance.resolver'
import * as schema from '@/modules/database/database.schema'
import * as enums from '@/modules/database/database.enums'
import * as plugin from '@/utils/utils-plugin'

@Injectable()
export class SystemDeptService extends Logger {
    constructor(private readonly database: DatabaseService) {
        super()
    }

    /**验证keyId是否存在：不存在抛出异常**/
    @AutoMethodDescriptor
    private async fetchBaseSystemCheckKeyIdDept(request: OmixRequest, body: OmixBaseOptions<Partial<schema.SchemaDept>>) {
        return await this.database.fetchConnectNotNull(this.database.schemaDept, {
            request,
            deplayName: this.fetchDeplayName(body.deplayName),
            message: body.message || `keyId:${body.where.keyId} 不存在`,
            dispatch: { where: { keyId: body.keyId } }
        })
    }

    /**新增部门**/
    @AutoMethodDescriptor
    public async httpBaseSystemDeptCreate(request: OmixRequest, body: field.BaseSystemDeptCreate) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
            await this.database.fetchConnectNull(this.database.schemaDept, {
                deplayName: this.deplayName,
                request,
                message: `name:${body.name} 已存在`,
                dispatch: { where: { name: body.name } }
            })
            await fetchHandler(isNotEmpty(body.bit), async () => {
                return await this.fetchBaseSystemCheckKeyIdDept(request, {
                    message: `bit:${body.bit} 不存在`,
                    deplayName: this.fetchDeplayName(this.deplayName),
                    where: { bit: body.bit }
                })
            })
            await fetchHandler(isNotEmpty(body.pid), async () => {
                return await this.fetchBaseSystemCheckKeyIdDept(request, {
                    message: `pid:${body.pid} 不存在`,
                    deplayName: this.fetchDeplayName(this.deplayName),
                    where: { keyId: body.pid }
                })
            })
            await this.database.fetchConnectCreate(ctx.manager.getRepository(schema.SchemaDept), {
                deplayName: this.deplayName,
                request,
                body: Object.assign(body, { keyId: await fetchIntNumber(), uid: request.user.uid })
            })
            return await ctx.commitTransaction().then(async () => {
                return await this.fetchResolver({ message: '新增成功' })
            })
        } catch (err) {
            await ctx.rollbackTransaction()
            return await this.fetchCatchCompiler(this.deplayName, err)
        } finally {
            await ctx.release()
        }
    }

    /**部门列表**/
    @AutoMethodDescriptor
    public async httpBaseSystemDeptColumn(request: OmixRequest) {
        try {
            return await this.database.fetchConnectBuilder(this.database.schemaDept, async qb => {
                await qb.leftJoinAndMapOne('t.user', schema.SchemaUser, 'user', 'user.uid = t.uid')
                await qb.leftJoinAndMapMany('t.items', schema.SchemaDeptUser, 'items', 'items.keyId = t.keyId')
                await this.database.fetchSelection(qb, [
                    ['t', ['keyId', 'uid', 'pid', 'bit', 'name', 'createTime', 'modifyTime']],
                    ['user', ['uid', 'name', 'status', 'id', 'number']],
                    ['items', ['keyId', 'uid']]
                ])

                await qb.where(`t.pid IS NOT NULL`)

                return await qb.getManyAndCount().then(async ([list = [], total = 0]) => {
                    return await this.fetchResolver({
                        total,
                        list: fetchTreeNodeDelete(tree.fromList(list, { id: 'keyId', pid: 'pid' }))
                    })
                })
            })
        } catch (err) {
            return await this.fetchCatchCompiler(this.deplayName, err)
        }
    }
}
