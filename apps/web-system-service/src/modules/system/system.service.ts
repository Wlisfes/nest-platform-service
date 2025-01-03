import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Logger } from '@/modules/logger/logger.service'
import { DatabaseService } from '@/modules/database/database.service'
import { OmixRequest } from '@/interface/instance.resolver'
import { isNotEmpty } from 'class-validator'
import { Not } from 'typeorm'
import * as systemUser from '@web-system-service/interface/system.resolver'
import * as enums from '@/modules/database/database.enums'
import * as utils from '@/utils/utils-common'
import * as plugin from '@/utils/utils-plugin'

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
    public async httpBaseCreateSystem(request: OmixRequest, body: systemUser.BaseCreateSystem) {
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
            return await this.fetchCatchCompiler('SystemService:httpBaseCreateSystem', err)
        } finally {
            await ctx.release()
        }
    }

    /**编辑系统配置**/
    public async httpBaseUpdateSystem(request: OmixRequest, body: systemUser.BaseUpdateSystem) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
            await this.database.fetchConnectNull(this.database.schemaSystem, {
                message: `${body.key} 已存在`,
                dispatch: { where: { key: body.key, vid: Not(body.vid) } }
            })
            await this.database.fetchConnectNull(this.database.schemaSystem, {
                message: `${body.router} 已存在`,
                dispatch: { where: { router: body.router, vid: Not(body.vid) } }
            })
            await utils.fetchHandler(isNotEmpty(body.pid), {
                handler: async () => {
                    await plugin.fetchCatchWherer(body.pid === body.vid, {
                        message: 'vid与pid不可相等'
                    })
                    return await this.httpCommonCheckSystem(body.pid)
                }
            })
            await this.database.fetchConnectUpdate(this.database.schemaSystem, {
                where: { vid: body.vid },
                body: Object.assign(body, { uid: request.user.uid })
            })
            return await ctx.commitTransaction().then(async () => {
                return await utils.fetchResolver({ message: '操作成功' })
            })
        } catch (err) {
            await ctx.rollbackTransaction()
            return await this.fetchCatchCompiler('SystemService:httpBaseUpdateSystem', err)
        } finally {
            await ctx.release()
        }
    }
}
