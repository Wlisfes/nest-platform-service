import { Injectable } from '@nestjs/common'
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { OmixRequest } from '@/interface'

@Injectable()
export class RabbitmqService extends Logger {
    constructor(private readonly amqpConnection: AmqpConnection) {
        super()
    }

    /**发送自定义消息**/
    @AutoDescriptor
    public async fetchDespatch(request: OmixRequest, exchange: string, routingKey: string, payload: Omix): Promise<boolean> {
        return await this.amqpConnection.publish(exchange, routingKey, payload)
    }
}
