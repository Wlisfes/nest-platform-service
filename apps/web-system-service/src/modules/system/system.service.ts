import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Logger } from '@/modules/logger/logger.service'
import { DatabaseService } from '@/modules/database/database.service'
import { OmixRequest } from '@/interface/instance.resolver'
import * as systemUser from '@web-system-service/interface/system.resolver'
import * as enums from '@/modules/database/database.enums'
import * as utils from '@/utils/utils-common'

@Injectable()
export class SystemService extends Logger {
    constructor(private readonly database: DatabaseService) {
        super()
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
