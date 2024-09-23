import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common'
import { Not } from 'typeorm'
import { LoggerService, Logger } from '@/services/logger.service'
import { DatabaseService } from '@/services/database.service'
import { divineResolver, divineIntNumber, divineBstract, divineHandler } from '@/utils/utils-common'
import { OmixHeaders } from '@/interface/instance.resolver'
import * as tree from 'tree-tool'
import * as env from '@web-account-service/interface/instance.resolver'
import * as enums from '@/enums/instance'

@Injectable()
export class PostService extends LoggerService {
    constructor(private readonly databaseService: DatabaseService) {
        super()
    }

    /**创建职位**/
    @Logger
    public async httpCreatePost(headers: OmixHeaders, staffId: string, body: env.BodyCreatePost) {
        const ctx = await this.databaseService.fetchConnectTransaction()
        try {
            await this.databaseService.fetchConnectNotEmptyError(headers, this.databaseService.tbPost, {
                message: '职位名称已存在',
                dispatch: {
                    where: { title: body.title, state: Not(enums.PostState.delete) }
                }
            })
        } catch (err) {
            await ctx.rollbackTransaction()
            return await this.fetchThrowException(err.message, err.status)
        } finally {
            await ctx.release()
        }
    }
}
