import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common'
import { Not } from 'typeorm'
import { LoggerService, Logger } from '@/services/logger.service'
import { DatabaseService } from '@/services/database.service'
import { WhereDeptService } from '@/wheres/where-dept.service'
import { divineResolver, divineIntNumber, divineBstract, divineHandler } from '@/utils/utils-common'
import { OmixHeaders } from '@/interface/instance.resolver'
import * as tree from 'tree-tool'
import * as env from '@web-account-service/interface/instance.resolver'
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
                message: 'deptName已存在',
                where: { deptName: body.deptName }
            })
            /**写入部门表**/
            return await this.databaseService.fetchConnectCreate(headers, this.databaseService.tbDept, {
                body: {
                    deptId: await divineIntNumber({ random: true, bit: 9 }),
                    deptName: body.deptName,
                    parentId: body.parentId ?? null
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
                message: 'deptId不存在',
                where: { deptId: body.deptId }
            })
            await this.whereDeptService.fetchDeptNotNullValidator(headers, {
                message: 'deptName已存在',
                where: { deptName: body.deptName, deptId: Not(body.deptId) }
            })
            /**更新部门表**/
            return await this.databaseService.fetchConnectUpdate(headers, this.databaseService.tbDept, {
                where: { deptId: body.deptId },
                body: { deptName: body.deptName }
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
            select: ['keyId', 'deptId', 'deptName', 'parentId', 'state']
        })
        return await divineResolver({
            total,
            list: tree.fromList(list, { id: 'deptId', pid: 'parentId' })
        })
    }
}
