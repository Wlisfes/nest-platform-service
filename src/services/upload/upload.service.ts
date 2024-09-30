import { Injectable, Inject } from '@nestjs/common'
import { LoggerService, Logger } from '@/services/logger.service'
import { OSS_CLIENT, OSS_STS_CLIENT, Client, AuthClient } from '@/services/upload/upload.provider'
import { Omix, OmixHeaders } from '@/interface/instance.resolver'

export interface UploadStream extends Omix {
    buffer: Buffer
    name: string
    size: number
}

@Injectable()
export class UploadService extends LoggerService {
    constructor(@Inject(OSS_CLIENT) public readonly client: Client, @Inject(OSS_STS_CLIENT) public readonly authClient: AuthClient) {
        super()
    }

    /**上传文件到阿里云OSS**/
    @Logger
    public async putStream(headers: OmixHeaders, body: UploadStream) {}
}
