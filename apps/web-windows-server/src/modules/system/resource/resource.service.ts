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
export class ResourceService extends Logger {
    constructor(private readonly database: DataBaseService, private readonly windows: WindowsService) {
        super()
    }

    /**新增菜单资源**/
    public async httpBaseSystemCreateResource(request: OmixRequest, body: windows.CreateResourceOptions) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        } finally {
            await ctx.release()
        }
    }

    /**编辑菜单资源**/
    public async httpBaseSystemUpdateResource(request: OmixRequest, body: windows.UpdateResourceOptions) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        } finally {
            await ctx.release()
        }
    }

    /**菜单资源列表**/
    public async httpBaseSystemColumnResource(request: OmixRequest, body: windows.ColumnResourceOptions) {}

    /**菜单资源状态变更**/
    public async httpBaseSystemSwitchResource(request: OmixRequest, body: windows.SwitchResourceOptions) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        } finally {
            await ctx.release()
        }
    }

    /**删除菜单资源**/
    public async httpBaseSystemDeleteResource(request: OmixRequest, body: windows.DeleteResourceOptions) {
        const ctx = await this.database.fetchConnectTransaction()
        try {
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        } finally {
            await ctx.release()
        }
    }
}
