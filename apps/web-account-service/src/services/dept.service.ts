import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common'
import { LoggerService, Logger } from '@/services/logger.service'
import { DatabaseService } from '@/services/database.service'
import { divineResolver, divineIntNumber, divineBstract, divineHandler } from '@/utils/utils-common'
import { OmixHeaders } from '@/interface/instance.resolver'
import * as tree from 'tree-tool'
import * as env from '@web-account-service/interface/instance.resolver'
import * as enums from '@/enums/instance'

@Injectable()
export class DeptService extends LoggerService {
    constructor(private readonly databaseService: DatabaseService) {
        super()
    }

    /**创建部门**/
    @Logger
    public async httpCreateDept(headers: OmixHeaders, staffId: string, body: env.BodyCreateDept) {
        const ctx = await this.databaseService.fetchConnectTransaction()
        try {
            await this.databaseService.fetchConnectNotEmptyError(headers, this.databaseService.tbDept, {
                message: '部门名称已存在',
                dispatch: {
                    where: { deptName: body.deptName }
                }
            })
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
            await this.databaseService.fetchConnectEmptyError(headers, this.databaseService.tbDept, {
                message: '部门ID不存在',
                dispatch: { where: { deptId: body.deptId } }
            })
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

    /**部门列表**/ //prettier-ignore
    @Logger
    public async httpTreeDept(headers: OmixHeaders, staffId: string) {
        return await this.databaseService.fetchConnectAndCount(headers, this.databaseService.tbDept, {
            select: ['keyId', 'deptId', 'deptName', 'parentId', 'state']
        }).then(async ({  list, total }) => {
            return await divineResolver({
                total,
                list: tree.fromList(list, { id: 'deptId', pid: 'parentId' })
            })
        })
    }
}
