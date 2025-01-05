import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { isEmpty, isNotEmpty, isString, isObject } from 'class-validator'
import { Omix } from '@/interface/instance.resolver'
import { Logger } from '@/modules/logger/logger.service'
import { CLIENT_REDIS, ClientRedis } from '@/modules/redis/redis.provider'
import * as keys from '@/modules/redis/redis.keys'

@Injectable()
export class RedisService extends Logger {
    public keys: typeof keys = keys
    constructor(@Inject(CLIENT_REDIS) public readonly client: ClientRedis) {
        super()
    }

    @Cron('*/30 * * * * *')
    public async fetchCronCallback() {
        this.client.ping(String(process.pid))
    }

    /**redis存储键组合方法**/
    public async fetchCompose(...args: Array<string | Omix>): Promise<string> {
        const data = args.find(item => isObject(item)) ?? {}
        const keys = [...args].filter(name => isString(name) && isNotEmpty(name)).join(':')
        const name = keys.replace(/\{(.*?)\}/g, (match, key) => (isEmpty(data[key]) ? match : data[key]))
        return await new Promise(resolve => {
            name.replace(/\{(.*?)\}/g, match => {
                throw new HttpException(`redis key ${match} 参数不可为空`, HttpStatus.BAD_REQUEST)
            })
            return resolve(name)
        })
    }

    /**redis存储**/
    public async setStore(scope: Omix<{ key: string; data: any; seconds?: number; logger?: boolean }>) {
        const datetime = Date.now()
        if (scope.seconds > 0) {
            return await this.client.set(scope.key, JSON.stringify(scope.data), 'EX', scope.seconds).then(async value => {
                if (scope.logger ?? false) {
                    this.logger.info('RedisService:setStore', {
                        duration: `${Date.now() - datetime}ms`,
                        log: { message: 'Redis存储', ...scope }
                    })
                }
                return { value, seconds: scope.seconds }
            })
        } else {
            return await this.client.set(scope.key, JSON.stringify(scope.data)).then(async value => {
                if (scope.logger ?? false) {
                    this.logger.info('RedisService:setStore', {
                        duration: `${Date.now() - datetime}ms`,
                        log: { message: 'Redis存储', ...scope }
                    })
                }
                return { value, seconds: 0 }
            })
        }
    }

    /**redis读取**/
    public async getStore<T>(scope: Omix<{ key: string; defaultValue?: T; logger?: boolean }>): Promise<T> {
        const datetime = Date.now()
        return await this.client.get(scope.key).then(async data => {
            const value = data ? JSON.parse(data) : scope.defaultValue
            if (scope.logger ?? true) {
                this.logger.info('RedisService:getStore', {
                    duration: `${Date.now() - datetime}ms`,
                    log: { message: 'Redis读取', ...scope, data }
                })
            }
            return value
        })
    }

    /**redis批量读取**/
    public async mgetStore(scope: Omix<{ keys: Array<string>; logger?: boolean }>) {
        const datetime = Date.now()
        return await this.client.mget(scope.keys).then(async data => {
            const values = scope.keys.map((key, index) => ({ key, value: data[index] ?? false }))
            if (scope.logger ?? false) {
                this.logger.info('RedisService:mgetStore', {
                    duration: `${Date.now() - datetime}ms`,
                    log: { message: 'Redis批量读取', ...scope, data: values }
                })
            }
            return values
        })
    }

    /**redis删除**/
    public async delStore(scope: Omix<{ key: string; logger?: boolean }>) {
        const datetime = Date.now()
        return await this.client.del(scope.key).then(async value => {
            if (scope.logger ?? false) {
                this.logger.info('RedisService:delStore', {
                    duration: `${Date.now() - datetime}ms`,
                    log: { message: 'Redis删除', ...scope }
                })
            }
            return value
        })
    }
}
