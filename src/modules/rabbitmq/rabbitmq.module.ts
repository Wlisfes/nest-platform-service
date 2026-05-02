import { Module, Global } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'
import { RabbitmqService } from '@/modules/rabbitmq/rabbitmq.service'

@Global()
@Module({
    imports: [
        RabbitMQModule.forRootAsync(RabbitMQModule, {
            inject: [ConfigService],
            useFactory(config: ConfigService) {
                return {
                    exchanges: [{ name: 'windows-wallet-consume', type: 'topic' }],
                    uri: config.get('RABBITMQ_URL'),
                    connectionInitOptions: { wait: false },
                    prefetchCount: 10,
                    queueOptions: {
                        durable: true
                    },
                    default: {
                        prefetchCount: 10,
                        options: { durable: true }
                    }
                }
            }
        })
    ],
    providers: [RabbitmqService],
    exports: [RabbitmqService]
})
export class RabbitmqModule {}
