import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { isEmpty, isNotEmpty, isString, isObject } from 'class-validator'
import { Omix, OmixRequest } from '@/interface/instance.resolver'
import { Logger, AutoMethodDescriptor } from '@/modules/logger/logger.service'
import { CLIENT_REDIS, ClientRedis } from '@/modules/redis/redis.provider'
export interface SetRedisOption extends Omix {
    /**存储键**/
    key: string
    /**存储数据**/
    data: any
    /**存储有效时间**/
    seconds?: number
    /**开启日志**/
    logger?: boolean
    /**输出日志方法名**/
    deplayName?: string
}
export interface GetRedisOption<T> extends Omit<SetRedisOption, 'data' | 'seconds'> {
    /**未读取数据默认值**/
    defaultValue?: T
}
export interface MgetRedisOption extends Pick<SetRedisOption, 'logger' | 'deplayName'> {
    /**存储键列表**/
    keys: Array<string>
}
export interface DelRedisOption extends Pick<SetRedisOption, 'logger' | 'key' | 'deplayName'> {}

@Injectable()
export class RedisService extends Logger {
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
    @AutoMethodDescriptor
    public async setStore(request: OmixRequest, body: SetRedisOption) {
        const logger = await this.fetchServiceLoggerTransaction(request, { deplayName: this.fetchDeplayName(body.deplayName) })
        if (body.seconds > 0) {
            return await this.client.set(body.key, JSON.stringify(body.data), 'EX', body.seconds).then(async value => {
                if (body.logger ?? false) {
                    logger.info({ message: 'Redis存储', key: body.key, data: body.data })
                }
                return { value, seconds: body.seconds }
            })
        } else {
            return await this.client.set(body.key, JSON.stringify(body.data)).then(async value => {
                if (body.logger ?? false) {
                    logger.info({ message: 'Redis存储', key: body.key, data: body.data })
                }
                return { value, seconds: 0 }
            })
        }
    }

    /**redis读取**/
    @AutoMethodDescriptor
    public async getStore<T>(request: OmixRequest, body: GetRedisOption<T>): Promise<T> {
        const logger = await this.fetchServiceLoggerTransaction(request, { deplayName: this.fetchDeplayName(body.deplayName) })
        return await this.client.get(body.key).then(async data => {
            const value = data ? JSON.parse(data) : body.defaultValue
            if (body.logger ?? true) {
                logger.info({ message: 'Redis读取', ...body, data })
            }
            return value
        })
    }

    /**redis批量读取**/
    @AutoMethodDescriptor
    public async mgetStore(request: OmixRequest, body: MgetRedisOption) {
        const logger = await this.fetchServiceLoggerTransaction(request, { deplayName: this.fetchDeplayName(body.deplayName) })
        return await this.client.mget(body.keys).then(async data => {
            const values = body.keys.map((key, index) => ({ key, value: data[index] ?? false }))
            if (body.logger ?? false) {
                logger.info({ message: 'Redis批量读取', ...body, data: values })
            }
            return values
        })
    }

    /**redis删除**/
    @AutoMethodDescriptor
    public async delStore(request: OmixRequest, body: DelRedisOption) {
        const logger = await this.fetchServiceLoggerTransaction(request, { deplayName: this.fetchDeplayName(body.deplayName) })
        return await this.client.del(body.key).then(async value => {
            if (body.logger ?? false) {
                logger.info({ message: 'Redis删除', ...body })
            }
            return value
        })
    }
}
