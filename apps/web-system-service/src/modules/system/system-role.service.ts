import { Injectable } from '@nestjs/common'
import { Logger } from '@/modules/logger/logger.service'
import { DatabaseService } from '@/modules/database/database.service'
import { Omix, OmixRequest } from '@/interface/instance.resolver'
import * as field from '@web-system-service/interface/instance.resolver'
import * as schema from '@/modules/database/database.schema'
import * as enums from '@/modules/database/database.enums'
import * as plugin from '@/utils/utils-plugin'
import * as utils from '@/utils/utils-common'

@Injectable()
export class SystemRoleService extends Logger {
    constructor(private readonly database: DatabaseService) {
        super()
    }

    /**新增角色权限**/
    public async httpBaseCreateSystemRole(request: OmixRequest, body: field.BaseCreateSystemRole) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
            await this.database.fetchConnectNull(this.database.schemaRole, {
                message: `name:${body.name} 已存在`,
                dispatch: { where: { name: body.name } }
            })
            await this.database.fetchConnectCreate(this.database.schemaRole, {
                body: Object.assign(body, { keyId: await utils.fetchIntNumber(), uid: request.user.uid })
            })
            return await ctx.commitTransaction().then(async () => {
                return await this.fetchResolver({ message: '新增成功' })
            })
        } catch (err) {
            await ctx.rollbackTransaction()
            return await this.fetchCatchCompiler('SystemRoleService:httpBaseCreateSystemRole', err)
        } finally {
            await ctx.release()
        }
    }
}
