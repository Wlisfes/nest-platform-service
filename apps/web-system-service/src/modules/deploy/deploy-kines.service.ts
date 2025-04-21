import { Injectable } from '@nestjs/common'
import { Logger, AutoMethodDescriptor } from '@/modules/logger/logger.service'
import { RedisService } from '@/modules/redis/redis.service'
import { CodexService } from '@/modules/common/codex.service'
import { Omix, OmixRequest, OmixResponse } from '@/interface/instance.resolver'

@Injectable()
export class DeployKinesService extends Logger {
    constructor(private readonly redisService: RedisService) {
        super()
    }
}
