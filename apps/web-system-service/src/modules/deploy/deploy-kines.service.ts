import { Injectable } from '@nestjs/common'
import { Logger, AutoMethodDescriptor } from '@/modules/logger/logger.service'
import { RedisService } from '@/modules/redis/redis.service'
import { DatabaseService } from '@/modules/database/database.service'
import { Omix, OmixRequest, OmixResponse } from '@/interface/instance.resolver'
import * as field from '@web-system-service/interface/instance.resolver'
import * as schema from '@/modules/database/database.schema'
import * as enums from '@/modules/database/database.enums'
import * as utils from '@/utils/utils-common'

@Injectable()
export class DeployKinesService extends Logger {
    constructor(private readonly redisService: RedisService, private readonly database: DatabaseService) {
        super()
    }

    /**更新自定义json**/
    @AutoMethodDescriptor
    public async httpBaseDeployKinesUpdate(request: OmixRequest, body: field.BaseDeployKinesUpdate) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
            /**把编辑操作插入事务**/
            await this.database.fetchConnectUpdate(ctx.manager.getRepository(schema.SchemaKines), {
                deplayName: this.deplayName,
                request,
                where: { type: body.type, uid: request.user.uid },
                body: Object.assign(body, { uid: request.user.uid })
            })
            /**提交事务**/
            return await ctx.commitTransaction().then(async () => {
                return await this.fetchResolver({ message: '操作成功' })
            })
        } catch (err) {
            await ctx.rollbackTransaction()
            return await this.fetchCatchCompiler(this.deplayName, err)
        } finally {
            await ctx.release()
        }
    }

    /**查询自定义json**/
    @AutoMethodDescriptor
    public async httpBaseDeployKinesCompiler(request: OmixRequest, body: field.BaseDeployKinesCompiler) {
        try {
            return await this.database.fetchConnectBuilder(this.database.schemaKines, async qb => {
                await qb.where(`t.type = :type AND t.uid = :uid`, { type: body.type, uid: request.user.uid })
                return await qb.getOne()
            })
        } catch (err) {
            return await this.fetchCatchCompiler(this.deplayName, err)
        }
    }
}
