import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common'
import { Not } from 'typeorm'
import { LoggerService, Logger } from '@/services/logger.service'
import { DatabaseService } from '@/services/database.service'
import { OmixHeaders } from '@/interface/instance.resolver'
import { divineResolver, divineIntNumber, divineBstract, divineHandler } from '@/utils/utils-common'
import * as env from '@web-account-service/interface/instance.resolver'
import * as enums from '@/enums/instance'

@Injectable()
export class DeptService extends LoggerService {
    constructor(private readonly databaseService: DatabaseService) {
        super()
    }

    /**创建部门**/
    @Logger
    public async httpCreateDept(headers: OmixHeaders, body: env.BodyCreateDept) {
        const ctx = await this.databaseService.fetchConnectTransaction()
        try {
            await this.databaseService.fetchConnectNotEmptyError(headers, this.databaseService.tbDept, {
                message: '部门名称已存在',
                dispatch: { where: body }
            })
            return await this.databaseService.fetchConnectCreate(headers, this.databaseService.tbDept, {
                body: {
                    deptId: await divineIntNumber({ random: true, bit: 9 }),
                    deptName: body.deptName
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
    public async httpUpdateDept(headers: OmixHeaders, body: env.BodyUpdateDept) {
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
}
