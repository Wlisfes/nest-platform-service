import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Logger } from '@/modules/logger/logger.service'
import { DatabaseService } from '@/modules/database/database.service'
import { OmixRequest } from '@/interface/instance.resolver'
import { isNotEmpty } from 'class-validator'
import * as systemUser from '@web-system-service/interface/system.resolver'
import * as enums from '@/modules/database/database.enums'
import * as utils from '@/utils/utils-common'

@Injectable()
export class SystemService extends Logger {
    constructor(private readonly database: DatabaseService) {
        super()
    }

    /**验证菜单是否存在**/
    public async httpCommonCheckSystem(vid: string) {
        return await this.database.fetchConnectNotNull(this.database.schemaSystem, {
            message: `${vid} 不存在`,
            dispatch: { where: { vid } }
        })
    }

    /**创建系统配置**/
    public async httpCommonBaseCreateSystem(request: OmixRequest, body: systemUser.BaseCreateSystem) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
            await this.database.fetchConnectNull(this.database.schemaSystem, {
                message: `${body.key} 已存在`,
                dispatch: { where: { key: body.key } }
            })
            await this.database.fetchConnectNull(this.database.schemaSystem, {
                message: `${body.router} 已存在`,
                dispatch: { where: { router: body.router } }
            })
            await utils.fetchHandler(isNotEmpty(body.pid), {
                handler: () => this.httpCommonCheckSystem(body.pid)
            })
            await this.database.fetchConnectCreate(this.database.schemaSystem, {
                body: Object.assign(body, {
                    vid: await utils.fetchIntNumber(),
                    uid: request.user.uid
                })
            })
            return await ctx.commitTransaction().then(async () => {
                return await utils.fetchResolver({ message: '操作成功' })
            })
        } catch (err) {
            await ctx.rollbackTransaction()
            return await this.fetchCatchCompiler('SystemService:httpCommonBaseCreateSystem', err)
        } finally {
            await ctx.release()
        }
    }
}
