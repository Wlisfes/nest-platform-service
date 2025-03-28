import { Injectable } from '@nestjs/common'
import { Not } from 'typeorm'
import { Logger } from '@/modules/logger/logger.service'
import { DatabaseService } from '@/modules/database/database.service'
import { Omix, OmixRequest } from '@/interface/instance.resolver'
import * as field from '@web-system-service/interface/instance.resolver'
import * as schema from '@/modules/database/database.schema'
import * as enums from '@/modules/database/database.enums'
import * as plugin from '@/utils/utils-plugin'
import * as utils from '@/utils/utils-common'

@Injectable()
export class SystemChunkService extends Logger {
    constructor(private readonly database: DatabaseService) {
        super()
    }

    /**新增字典**/
    public async httpBaseCreateSystemChunk(request: OmixRequest, body: field.BaseCreateSystemChunk) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
            console.log(body)
            await this.database.fetchConnectNull(this.database.schemaChunk, {
                message: `value:${body.value} 已存在`,
                dispatch: { where: { value: body.value, type: body.type } }
            })
            await this.database.fetchConnectCreate(this.database.schemaChunk, {
                body: Object.assign(body, { keyId: await utils.fetchIntNumber(), uid: request.user.uid })
            })
            return await ctx.commitTransaction().then(async () => {
                return await this.fetchResolver({ message: '新增成功' })
            })
        } catch (err) {
            await ctx.rollbackTransaction()
            return await this.fetchCatchCompiler('SystemChunkService:httpBaseCreateSystemChunk', err)
        } finally {
            await ctx.release()
        }
    }
}
