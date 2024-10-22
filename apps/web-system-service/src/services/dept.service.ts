import { Injectable } from '@nestjs/common'
import { Not } from 'typeorm'
import { LoggerService, Logger } from '@/services/logger.service'
import { DatabaseService } from '@/services/database.service'
import { WhereDeptService } from '@/wheres/where-dept.service'
import { fetchResolver, fetchIntNumber } from '@/utils/utils-common'
import { OmixHeaders } from '@/interface/instance.resolver'
import * as tree from 'tree-tool'
import * as env from '@web-system-service/interface/instance.resolver'
import * as enums from '@/enums/instance'

@Injectable()
export class DeptService extends LoggerService {
    constructor(private readonly databaseService: DatabaseService, private readonly whereDeptService: WhereDeptService) {
        super()
    }

    /**创建部门**/
    @Logger
    public async httpCreateDept(headers: OmixHeaders, staffId: string, body: env.BodyCreateDept) {
        const ctx = await this.databaseService.fetchConnectTransaction()
        try {
            await this.whereDeptService.fetchDeptNotNullValidator(headers, {
                message: `${body.name}已存在`,
                where: { name: body.name }
            })
            /**写入部门表**/
            return await this.databaseService.fetchConnectCreate(headers, this.databaseService.tbDept, {
                body: {
                    id: fetchIntNumber({ random: true, bit: 9 }),
                    name: body.name,
                    pid: body.pid
                }
            })
        } catch (err) {
            await ctx.rollbackTransaction()
            return await this.fetchThrowException(err.message, err.status)
        } finally {
            await ctx.release()
        }
    }

    /**编辑部门**/
    @Logger
    public async httpUpdateDept(headers: OmixHeaders, staffId: string, body: env.BodyUpdateDept) {
        const ctx = await this.databaseService.fetchConnectTransaction()
        try {
            await this.whereDeptService.fetchDeptNullValidator(headers, {
                message: 'ID不存在',
                where: { id: body.id }
            })
            await this.whereDeptService.fetchDeptNotNullValidator(headers, {
                message: `${body.name}已存在`,
                where: { name: body.name, id: Not(body.id) }
            })
            /**更新部门表**/
            return await this.databaseService.fetchConnectUpdate(headers, this.databaseService.tbDept, {
                where: { id: body.id },
                body: { name: body.name }
            })
        } catch (err) {
            await ctx.rollbackTransaction()
            return await this.fetchThrowException(err.message, err.status)
        } finally {
            await ctx.release()
        }
    }

    /**部门列表**/
    @Logger
    public async httpTreeDept(headers: OmixHeaders, staffId: string) {
        const { list, total } = await this.databaseService.fetchConnectAndCount(headers, this.databaseService.tbDept, {
            select: ['keyId', 'id', 'name', 'pid', 'state']
        })
        return await fetchResolver({
            total,
            list: tree.fromList(list, { id: 'id', pid: 'pid' })
        })
    }
}
