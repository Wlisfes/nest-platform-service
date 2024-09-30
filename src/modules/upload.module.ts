import { Module, Global } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { UploadService } from '@/services/upload/upload.service'
import { OSS_CLIENT, OSS_STS_CLIENT, createClient, createAuthClient } from '@/services/upload/upload.provider'

@Global()
@Module({
    imports: [],
    controllers: [],
    providers: [
        {
            provide: OSS_CLIENT,
            inject: [ConfigService],
            async useFactory(config: ConfigService) {
                return await createClient({
                    region: config.get('OSS_REGION'),
                    endpoint: config.get('OSS_ENDPOINT'),
                    accessKeyId: config.get('OSS_ACCESSKEYID'),
                    accessKeySecret: config.get('OSS_ACCESSKEYSECRET'),
                    bucket: config.get('OSS_BUCKET'),
                    timeout: Number(config.get('OSS_TIMEOUT') ?? 60000)
                })
            }
        },
        {
            provide: OSS_STS_CLIENT,
            inject: [ConfigService],
            async useFactory(config: ConfigService) {
                return await createAuthClient({
                    accessKeyId: config.get('OSS_ACCESSKEYID'),
                    accessKeySecret: config.get('OSS_ACCESSKEYSECRET')
                })
            }
        },
        UploadService
    ],
    exports: [UploadService]
})
export class UploadModule {}
