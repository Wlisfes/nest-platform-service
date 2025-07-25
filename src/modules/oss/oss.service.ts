import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'
import { Logger } from '@/modules/logger/logger.service'
import { RedisService } from '@/modules/redis/redis.service'
import { Omix, OmixRequest } from '@/interface/instance.resolver'
import { OSS_CLIENT, OSS_STS_CLIENT, Client, AuthClient } from '@/modules/oss/oss.provider'
import * as utils from '@/utils/utils-common'

@Injectable()
export class OSSService extends Logger {
    constructor(
        @Inject(OSS_CLIENT) public readonly client: Client,
        @Inject(OSS_STS_CLIENT) public readonly authClient: AuthClient,
        private readonly redisService: RedisService,
        private readonly httpService: HttpService
    ) {
        super()
    }

    /**流式文件上传**/
    public async httpStreamUploader(request: OmixRequest, body: Omix<{ buffer: Buffer; fileName: string; folder: string }>) {
        try {
            const datetime = Date.now()
            const suffix = body.fileName.split('.').pop().toLowerCase()
            const fileId = await utils.fetchIntNumber()
            const folder = ['platform', body.folder, `${fileId}.${suffix}`].join('/')
            return await this.client.put(folder, body.buffer).then(async (response: Omix) => {
                if (response.res.status == HttpStatus.OK) {
                    this.logger.info(`OSSService:httpStreamUploader`, {
                        duration: `${Date.now() - datetime}ms`,
                        log: { message: `文件上传成功`, fileName: body.fileName }
                    })
                    return await this.fetchResolver({ message: '上传成功', name: response.name, url: response.url })
                }
                throw new HttpException(
                    response.res.statusMessage ?? '文件上传失败',
                    response.res.status ?? HttpStatus.INTERNAL_SERVER_ERROR
                )
            })
        } catch (err) {
            return await this.fetchCatchCompiler('OSSService:httpStreamRemoteUploader', err)
        }
    }

    /**上传远程文件**/
    public async httpStreamRemoteUploader(request: OmixRequest, body: Omix<{ fileUrl: string; folder: string }>) {
        try {
            const datetime = Date.now()
            const response = await firstValueFrom(this.httpService.get(body.fileUrl, { responseType: 'arraybuffer' }))
            const buffer = Buffer.from(response.data)
            const fileSize = await utils.fetchBytefor(buffer.length)
            const fileName = body.fileUrl.split('/').pop().split(/[?#]/)[0]
            this.logger.info(`OSSService:httpStreamRemoteUploader`, {
                duration: `${Date.now() - datetime}ms`,
                log: { message: `远程文件拉取成功`, fileUrl: body.fileUrl, fileSize, fileName }
            })
            return await this.httpStreamUploader(request, { buffer, fileName, folder: body.folder })
        } catch (err) {
            return await this.fetchCatchCompiler('OSSService:httpStreamRemoteUploader', err)
        }
    }
}
