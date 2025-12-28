import { Injectable, HttpException } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { OmixRequest } from '@/interface'
import * as windows from '@web-windows-server/interface'

@Injectable()
export class ChunkService extends Logger {
    constructor() {
        super()
    }

    /**通用下拉字典**/
    @AutoDescriptor
    public async httpBaseChunkSelect(request: OmixRequest, body: windows.ChunkSelectOptions) {
        try {
            return await this.fetchResolver({
                message: '操作成功',
                chunk: body.type.reduce((obs, key: string) => ({ ...obs, [key]: Object.values(windows.COMMON_CHUNK[key].columns) }), {})
            })
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        }
    }
}
