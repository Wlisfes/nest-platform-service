import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { isEmpty } from 'class-validator'
import { compareSync } from 'bcryptjs'
import { pick } from 'lodash'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { DataBaseService, WindowsService, enums } from '@/modules/database/database.service'
import { CodexService } from '@/modules/common/modules/codex.service'
import { RedisService } from '@/modules/redis/redis.service'
import { JwtService } from '@/modules/jwt/jwt.service'
import { fetchTreeNodeBlock } from '@/utils'
import { OmixRequest, OmixResponse, CodexCreateOptions } from '@/interface'
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
        } catch (err) {
            this.logger.error(err)
            throw new HttpException(err.message, err.status, err.options)
        }
    }
}
