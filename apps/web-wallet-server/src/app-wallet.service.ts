import { Injectable } from '@nestjs/common'
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq'
import { Logger } from '@/modules/logger/logger.service'

@Injectable()
export class AppWalletService extends Logger {
    /**自定义消息消费者**/
    @RabbitSubscribe({
        exchange: 'windows-wallet-consume',
        routingKey: 'windows-wallet-consume.messager',
        queue: 'windows-wallet-consume.messager'
    })
    public async fetchWalletConsumeMessager(msg: any) {
        this.logger.info({ message: '收到自定义消息', data: msg })
    }
}
