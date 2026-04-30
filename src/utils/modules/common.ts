import { snowflakeId } from 'snowflake-id-maker'
import { zh_CN, Faker } from '@faker-js/faker'
import { Request } from 'express'
import { getClientIp } from 'request-ip'
import { resolve } from 'path'
import { cloneDeep, concat, omit, pick } from 'lodash'
import { isNotEmpty, isEmpty, isArray, isEmail, isString, isObject, isBoolean } from 'class-validator'
import tree from 'tree-tool'
import dotenv from 'dotenv'
import moment from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
moment.extend(timezone)
moment.extend(utc)

export { tree, moment, cloneDeep, concat, omit, pick, isNotEmpty, isEmpty, isArray, isEmail, isString, isObject, isBoolean }

/**虚拟数据实例**/
export const faker = new Faker({ locale: zh_CN })

/**
 * 根据环境读取env配置
 * @returns env环境配置对象
 */
export function fetchGlobalEnv<T>(): Omix<T> {
    return (dotenv.config({
        path: resolve(process.cwd(), `./env/.env.${process.env.NODE_ENV}`)
    }).parsed ?? {}) as Omix<T>
}

/**深度克隆组合**/
export function fetchCloneByte<T extends Omix, M extends Omix = {}>(data: T, mergeData: M = {} as M): T & M {
    return Object.assign(cloneDeep(data), mergeData)
}

/**
 * 生成纯数字的雪花ID、随机字符串
 * @param options 配置项
 * @param options.bit 随机字符长度
 * @param options.sync 是否同步返回，默认异步
 * @returns 根据sync参数返回同步值或Promise
 */

export function fetchIntNumber<T extends { bit?: number; sync?: boolean } = {}>(
    options?: T
): T extends { sync: true } ? string : Promise<string> {
    const str = fetchWherer((options?.bit ?? 0) > 0, {
        value: Array.from({ length: options?.bit ?? 4 }, () => Math.floor(Math.random() * 9) + 1).join(''),
        fallback: snowflakeId({ worker: process.pid, epoch: 1199145600000 })
    })
    return (options?.sync ? str : Promise.resolve(str)) as never
}

/**
 * 条件值返回
 * @param where 执行条件
 * @param options.value 条件正确返回值
 * @param options.fallback 条件错误返回值
 * @param options.defaultValue 默认返回值
 * @returns value 根据条件返回不同值
 */
export function fetchWherer<T>(where: boolean, options: Omix<{ value: T; fallback?: T; defaultValue?: T }>): T {
    if (where) {
        return options.value ?? options.defaultValue
    }
    return options.fallback ?? options.defaultValue
}

/**
 * 获取IP
 * @param request 请求对象
 * @returns ip 返回ip值
 */
export function fetchIPClient(request: Omix<Request>): string {
    const ipv4 = getClientIp(request)
    return ['localhost', '::1', '::ffff:127.0.0.1'].includes(ipv4) ? '127.0.0.1' : ipv4.replace(/^.*:/, '')
}

/**
 * 获取随机值
 * @param keys 指定随机值列表
 * @returns key 返回随机值
 */
export function fetchAtwiCommer<T>(keys: Array<T>): T {
    return keys[Math.floor(Math.random() * (keys.length + Number.EPSILON))]
}

/**
 * 条件链式执行函数
 * @param where 执行条件
 * @param handler 执行回调
 */
export async function fetchHandler<T>(where: boolean | Function, handler?: Function): Promise<T> {
    const value = typeof where === 'function' ? await where() : where
    if (value && typeof handler === 'function') {
        return (await handler()) as T
    }
    return value as T
}

/**对象查找**/
export function fetchCurrent<T extends Omix>(data: Array<T>, callback: (e: Omix<T>) => boolean) {
    return (data.find(item => callback(item)) ?? {}) as T
}

/**字段更新**/
export function fetchObsUpdate<T extends Omix>(data: T, options: Omix) {
    return Object.assign(data, options)
}
