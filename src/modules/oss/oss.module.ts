import { Module, Global } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HttpModule } from '@nestjs/axios'
import { OSSService } from '@/modules/oss/oss.service'
import { OSS_CLIENT, OSS_STS_CLIENT, fetchCreateClient, fetchCreateAuthClient } from '@/modules/oss/oss.provider'

@Global()
@Module({
    imports: [HttpModule],
    exports: [OSSService],
    providers: [
        {
            provide: OSS_CLIENT,
            inject: [ConfigService],
            async useFactory(config: ConfigService) {
                return await fetchCreateClient({
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
                return await fetchCreateAuthClient({
                    accessKeyId: config.get('OSS_ACCESSKEYID'),
                    accessKeySecret: config.get('OSS_ACCESSKEYSECRET')
                })
            }
        },
        OSSService
    ]
})
export class OSSModule {}
