import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Logger } from '@/modules/logger/logger.service'
import { DatabaseService } from '@/modules/database/database.service'
import { OmixRequest } from '@/interface/instance.resolver'
import { isNotEmpty } from 'class-validator'
import { Not } from 'typeorm'
import * as schemas from '@web-system-service/interface/router.resolver'
import * as enums from '@/modules/database/database.enums'
import * as utils from '@/utils/utils-common'
import * as plugin from '@/utils/utils-plugin'

@Injectable()
export class SystemRouterService extends Logger {
    constructor(private readonly database: DatabaseService) {
        super()
    }

    /**验证菜单是否存在**/
    public async httpCommonCheckSystem(id: string) {
        return await this.database.fetchConnectNotNull(this.database.schemaRouter, {
            message: `${id} 不存在`,
            dispatch: { where: { id } }
        })
    }

    /**新增菜单配置**/
    public async httpBaseCreateSystemRouter(request: OmixRequest, body: schemas.BaseCreateSystemRouter) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
            await this.database.fetchConnectNull(this.database.schemaRouter, {
                message: `${body.key} 已存在`,
                dispatch: { where: { key: body.key } }
            })
            await this.database.fetchConnectNull(this.database.schemaRouter, {
                message: `${body.router} 已存在`,
                dispatch: { where: { router: body.router } }
            })
            await utils.fetchHandler(isNotEmpty(body.pid), {
                async handler() {
                    return await this.httpCommonCheckSystem(body.pid)
                }
            })
            await this.database.fetchConnectCreate(this.database.schemaRouter, {
                body: Object.assign(body, {
                    id: await utils.fetchIntNumber(),
                    uid: request.user.uid
                })
            })
            return await ctx.commitTransaction().then(async () => {
                return await utils.fetchResolver({ message: '操作成功' })
            })
        } catch (err) {
            await ctx.rollbackTransaction()
            return await this.fetchCatchCompiler('SystemRouterService:httpBaseCreateSystemRouter', err)
        } finally {
            await ctx.release()
        }
    }

    /**编辑系统配置**/
    public async httpBaseUpdateSystemRouter(request: OmixRequest, body: schemas.BaseUpdateSystemRouter) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
            await this.database.fetchConnectNull(this.database.schemaRouter, {
                message: `${body.key} 已存在`,
                dispatch: { where: { key: body.key, id: Not(body.id) } }
            })
            await this.database.fetchConnectNull(this.database.schemaRouter, {
                message: `${body.router} 已存在`,
                dispatch: { where: { router: body.router, id: Not(body.id) } }
            })
            await utils.fetchHandler(isNotEmpty(body.pid), {
                async handler() {
                    await plugin.fetchCatchWherer(body.pid === body.id, { message: 'vid与pid不可相等' })
                    return await this.httpCommonCheckSystem(body.pid)
                }
            })
            await this.database.fetchConnectUpdate(this.database.schemaRouter, {
                where: { id: body.id },
                body: Object.assign(body, { uid: request.user.uid })
            })
            return await ctx.commitTransaction().then(async () => {
                return await utils.fetchResolver({ message: '操作成功' })
            })
        } catch (err) {
            await ctx.rollbackTransaction()
            return await this.fetchCatchCompiler('SystemRouterService:httpBaseUpdateSystemRouter', err)
        } finally {
            await ctx.release()
        }
    }
}
