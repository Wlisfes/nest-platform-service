import { snowflakeId } from 'snowflake-id-maker'
import { zh_CN, Faker } from '@faker-js/faker'
import { isNotEmpty, isEmpty, isString, isNumber, isObject } from 'class-validator'
import { Omix, OmixHeaders } from '@/interface/instance.resolver'
import * as tree from 'tree-tool'
import * as web from '@/config/web-common'
import * as dayjs from 'dayjs'
import * as utc from 'dayjs/plugin/utc'
import * as timezone from 'dayjs/plugin/timezone'
export { tree, isNotEmpty, isEmpty, isString, isNumber, isObject }
dayjs.extend(timezone)
dayjs.extend(utc)
/**dayjs实例**/
export const moment = dayjs

/**虚拟数据实例**/
export const faker = new Faker({
    locale: zh_CN
})

/**生成纯数字的雪花ID、随机字符串**/
export async function fetchIntNumber(scope: Partial<Omix<{ worker: number; epoch: number; random: boolean; bit: number }>> = {}) {
    if (scope.random) {
        return Array.from({ length: scope.bit ?? 6 }, x => Math.floor(Math.random() * 9) + 1).join('')
    }
    return snowflakeId({
        worker: scope.worker ?? process.pid,
        epoch: scope.epoch ?? 1199145600000
    })
}

/**参数组合**/
export async function fetchParameter<T>(params: Omix<T>): Promise<Omix<T>> {
    return params
}

/**返回包装**/
export async function fetchResolver<T = Partial<Omix<{ message: string; list: Array<Omix>; total: number; page: number; size: number }>>>(
    data: T,
    handler?: Function
) {
    await fetchHandler(Boolean(handler), handler)
    return data
}

/**条件链式执行函数**/
export async function fetchHandler<T>(where: boolean | Function, handler?: Function): Promise<T> {
    const value = typeof where === 'function' ? await where() : where
    if (value && typeof handler === 'function') {
        return (await handler()) as T
    }
    return value as T
}

/**条件值返回**/
export function fetchCaseWherer<T>(where: boolean, scope: Omix<{ value: T; fallback?: T; defaultValue?: T }>): T {
    if (where) {
        return scope.value ?? scope.defaultValue
    }
    return scope.fallback ?? scope.defaultValue
}

/**日志聚合**/
export function fetchCompiler(headers: OmixHeaders = {}, log: Omix | string = {}) {
    const duration = headers[web.WEB_COMMON_HEADER_STARTTIME]
    return {
        log,
        duration: fetchCaseWherer(isNotEmpty(duration), { value: `${Date.now() - Number(duration)}ms`, defaultValue: null }),
        [web.WEB_COMMON_HEADER_CONTEXTID]: headers[web.WEB_COMMON_HEADER_CONTEXTID]
    }
}
