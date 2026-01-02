import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { DataBaseService, WindowsService } from '@/modules/database/database.service'
import { OmixRequest } from '@/interface'
import { isEmpty, isNotEmpty } from 'class-validator'
import { faker } from '@/utils'
import * as schema from '@/modules/database/schema'
import * as enums from '@/modules/database/enums'
import * as windows from '@web-windows-server/interface'

@Injectable()
export class AccountService extends Logger {
    constructor(private readonly database: DataBaseService, private readonly windows: WindowsService) {
        super()
    }

    /**新增账号**/
    @AutoDescriptor
    public async httpBaseSystemCreateAccount(request: OmixRequest, body: windows.CreateAccountOptions) {
        const ctx = await this.database.transaction()
        try {
            await this.database.builder(this.windows.account, async qb => {
                qb.where(`t.number = :number OR t.phone = :phone`, { number: body.number, phone: body.phone })
                return await qb.getOne().then(async node => {
                    if (isNotEmpty(node) && node.number == body.number) {
                        throw new HttpException(`number:${body.number} 已存在`, HttpStatus.BAD_REQUEST)
                    } else if (isNotEmpty(node) && node.phone == body.phone) {
                        throw new HttpException(`phone:${body.phone} 已存在`, HttpStatus.BAD_REQUEST)
                    }
                    return node
                })
            })
            await this.database.create(ctx.manager.getRepository(schema.WindowsAccount), {
                stack: this.stack,
                request,
                body: body
            })
            return await ctx.commitTransaction().then(async () => {
                return await this.fetchResolver({ message: '操作成功' })
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        } finally {
            await ctx.release()
        }
    }

    /**账号列表**/
    @AutoDescriptor
    public async httpBaseSystemColumnAccount(request: OmixRequest, body: windows.ColumnAccountOptions) {
        try {
            return await this.database.builder(this.windows.account, async qb => {
                qb.skip((body.page - 1) * body.size)
                qb.take(body.size)
                return await qb.getManyAndCount().then(async ([list, total]) => {
                    return await this.fetchResolver({ list, total })
                })
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        }
    }

    /**编辑账号状态**/
    @AutoDescriptor
    public async httpBaseSystemUpdateSwitchAccount(request: OmixRequest, body: windows.UpdateSwitchAccountOptions) {}
}
