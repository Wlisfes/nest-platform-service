import { HttpException, HttpStatus } from '@nestjs/common'
import { Request } from 'express'
import { snowflakeId } from 'snowflake-id-maker'
import { zh_CN, Faker } from '@faker-js/faker'
import { isNotEmpty } from 'class-validator'
import { Omix, OmixHeaders, OmixError } from '@/interface/instance.resolver'
import * as dayjs from 'dayjs'
import * as utc from 'dayjs/plugin/utc'
import * as timezone from 'dayjs/plugin/timezone'
import * as axios from 'axios'
import * as web from '@/config/web-instance'
dayjs.extend(timezone)
dayjs.extend(utc)

/**dayjs实例**/
export const moment = dayjs

/**Axios请求实例**/
export const request = axios.default

/**虚拟数据实例**/
export const faker = new Faker({
    locale: zh_CN
})

/**生成纯数字的雪花ID、随机字符串**/
export function fetchIntNumber(scope: Partial<Omix<{ worker: number; epoch: number; random: boolean; bit: number }>> = {}) {
    if (scope.random) {
        return Array.from({ length: scope.bit ?? 6 }, x => Math.floor(Math.random() * 9) + 1).join('')
    }
    return snowflakeId({
        worker: scope.worker ?? process.pid,
        epoch: scope.epoch ?? 1199145600000
    })
}

/**返回包装**/
export async function fetchResolver<T = Partial<Omix<{ message: string; list: Array<Omix>; total: number; page: number; size: number }>>>(
    data: T,
    handler?: Function
) {
    await fetchHandler(Boolean(handler), { handler })
    return data
}

/**条件链式执行函数**/
export async function fetchHandler<T>(where: boolean | Function, scope: Omix<{ handler: Function; failure?: Function }>): Promise<T> {
    if (typeof where === 'function') {
        where = await where()
    }
    if (where) {
        return await scope.handler()
    } else {
        return (await scope.failure?.()) ?? undefined
    }
}

/**批量执行异步方法**/
export async function fetchBatchHandler(handlers: Array<any>, scope: Omix<{ handler?: Function; failure?: Function }> = {}) {
    try {
        return await Promise.all(handlers).then(async response => {
            return await fetchHandler(Boolean(scope.handler), {
                handler: () => scope.handler(response)
            })
        })
    } catch (e) {
        return await fetchHandler(Boolean(scope.failure), {
            handler: () => scope.failure!(e)
        })
    }
}

/**延时方法**/
export function fetchDelay(delay = 100, handler?: Function) {
    return new Promise(resolve => {
        const timeout = setTimeout(() => {
            handler?.()
            resolve(undefined)
            clearTimeout(timeout)
        }, delay)
    })
}

/**条件值返回**/
export function fetchCaseWherer<T>(where: boolean, scope: Omix<{ value: T; fallback?: T; defaultValue?: T }>): T {
    if (where) {
        return scope.value ?? scope.defaultValue
    }
    return scope.fallback ?? scope.defaultValue
}

/**参数组合**/
export async function fetchParameter<T>(params: Omix<T>): Promise<Omix<T>> {
    return params
}

/**日志聚合**/
export function fetchLogger(headers: OmixHeaders = {}, log: Omix | string = {}) {
    const duration = headers[web.WEB_COMMON_HEADER_STARTTIME]
    return {
        log,
        duration: fetchCaseWherer(isNotEmpty(duration), { value: `${Date.now() - Number(duration)}ms`, defaultValue: null }),
        [web.WEB_COMMON_HEADER_CONTEXTID]: headers[web.WEB_COMMON_HEADER_CONTEXTID]
    }
}

/**提取日志参数**/
export function fetchBstract(headers: OmixHeaders = {}) {
    return {
        logId: headers[web.WEB_COMMON_HEADER_CONTEXTID],
        ua: headers['user-agent'] ?? null,
        ip: headers.ip ?? null,
        browser: headers.browser ?? null,
        platform: headers.platform ?? null
    }
}

/**自定义Error信息**/
export function fetchOmixError<T = { message: string; status: number }>(scope: Omix<T>): OmixError<T> {
    const err = new Error(scope.message) as OmixError<T>
    err.data = scope
    return err
}

/**条件捕获、异常抛出**/
export async function fetchCatchWherer(where: boolean, scope: Omix<{ message: string; status?: number; cause?: Omix }>) {
    return await fetchHandler(where, {
        handler: () => {
            throw new HttpException(
                scope.cause ? { message: scope.message, cause: scope.cause } : scope.message,
                scope.status ?? HttpStatus.BAD_REQUEST
            )
        }
    })
}

/**字节转换文字输出**/
export async function fetchBytefor(byte: number, dec: number = 2) {
    if (byte === 0) return 'Byte'
    const k = 1024
    const dm = dec < 0 ? 0 : dec
    const sizes = ['Byte', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const i = Math.floor(Math.log(byte) / Math.log(k))
    return parseFloat((byte / Math.pow(k, i)).toFixed(dm)) + sizes[i]
}

/**redis存储键组合方法**/
export async function fetchKeyCompose(namespaces: string, ...args: string[]) {
    return [namespaces, ...args].filter(key => isNotEmpty(key)).join(':')
}

/**邮箱号混淆**/
export async function fetchMaskCharacter(type: 'email', str: string) {
    if (type === 'email') {
        const prefix = str.substring(0, str.indexOf('@'))
        const suffix = str.substring(str.indexOf('@'), str.length)
        const fill = prefix.length >= 2 ? prefix.substring(0, 2) : prefix
        return fill.padEnd(8, '*') + suffix
    }
    return str
}

/**文件名称、类型挂载**/
export function fetchFileRequest(request: Request, file: Omix, cb: Function) {
    file.body = request.body
    file.name = Buffer.from(file.originalname, 'binary').toString('utf-8')
    return cb(null, true)
}

/**替换文件后辍名**/
export async function fetchFileNameReplace(fileName: string, suffix: string) {
    if (fileName.includes('.')) {
        return fileName.replace(/\.[^.]+$/, `.${suffix}`)
    }
    return [fileName, suffix].join('.')
}
