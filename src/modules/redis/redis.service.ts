import { Injectable, Inject } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { Omix } from '@/interface/instance.resolver'
import { Logger } from '@/modules/logger/logger.service'
import { CLIENT_REDIS, ClientRedis } from '@/modules/redis/redis.provider'

@Injectable()
export class RedisService extends Logger {
    constructor(@Inject(CLIENT_REDIS) public readonly client: ClientRedis) {
        super()
    }

    @Cron('*/30 * * * * *')
    public async fetchCronCallback() {
        this.client.ping(String(process.pid))
    }

    /**redis存储**/
    public async setStore(scope: Omix<{ key: string; data: any; seconds?: number; logger?: boolean }>) {
        if (scope.seconds > 0) {
            return await this.client.set(scope.key, JSON.stringify(scope.data), 'EX', scope.seconds).then(async value => {
                if (scope.logger ?? true) {
                    this.logger.info('RedisService:setStore', { message: 'Redis存储', ...scope })
                }
                return value
            })
        } else {
            return await this.client.set(scope.key, JSON.stringify(scope.data)).then(async value => {
                if (scope.logger ?? true) {
                    this.logger.info('RedisService:setStore', { message: 'Redis存储', ...scope })
                }
                return value
            })
        }
    }

    /**redis读取**/
    public async getStore<T>(scope: Omix<{ key: string; defaultValue?: T; logger?: boolean }>): Promise<T> {
        return await this.client.get(scope.key).then(async data => {
            const value = data ? JSON.parse(data) : scope.defaultValue
            if (scope.logger ?? true) {
                this.logger.info('RedisService:getStore', { message: 'Redis读取', ...scope, data })
            }
            return value
        })
    }

    /**redis批量读取**/
    public async mgetStore(scope: Omix<{ keys: Array<string>; logger?: boolean }>) {
        return await this.client.mget(scope.keys).then(async data => {
            const values = scope.keys.map((key, index) => ({ key, value: data[index] ?? false }))
            if (scope.logger ?? true) {
                this.logger.info('RedisService:mgetStore', { message: 'Redis批量读取', values })
            }
            return values
        })
    }

    /**redis删除**/
    public async delStore(scope: Omix<{ key: string; logger?: boolean }>) {
        return await this.client.del(scope.key).then(async value => {
            if (scope.logger ?? true) {
                this.logger.info('RedisService:delStore', { message: 'Redis删除', ...scope })
            }
            return value
        })
    }
}
