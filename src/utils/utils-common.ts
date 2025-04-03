import { snowflakeId } from 'snowflake-id-maker'
import { zh_CN, Faker } from '@faker-js/faker'
import { cloneDeep, concat, pick, omit } from 'lodash'
import { isNotEmpty, isEmpty, isString, isNumber, isObject } from 'class-validator'
import { Omix } from '@/interface/instance.resolver'
import * as tree from 'tree-tool'
import * as dayjs from 'dayjs'
import * as utc from 'dayjs/plugin/utc'
import * as timezone from 'dayjs/plugin/timezone'
export { tree, cloneDeep, concat, pick, omit, isNotEmpty, isEmpty, isString, isNumber, isObject }
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

/**对象、列表转换回显**/
export function fetchColumn(data: Array<Omix> | Omix, value: any) {
    if (Array.isArray(data)) {
        return data.find(item => item.value == value) ?? null
    }
    return data[value] ?? null
}

/**参数组合**/
export async function fetchParameter<T>(params: Omix<T>): Promise<Omix<T>> {
    return params
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

/**字节转换文字输出**/
export async function fetchBytefor(byte: number, dec: number = 2) {
    if (byte === 0) return 'Byte'
    const k = 1024
    const dm = dec < 0 ? 0 : dec
    const sizes = ['Byte', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const i = Math.floor(Math.log(byte) / Math.log(k))
    return parseFloat((byte / Math.pow(k, i)).toFixed(dm)) + sizes[i]
}

/**移除空数据children字段**/
export function fetchRemoveTreeNode<T extends Omix>(data: Array<T>): Array<T> {
    data.forEach((node: Omix) => {
        if (node.children && node.children.length > 0) {
            return fetchRemoveTreeNode(node.children)
        } else if (node.children && node.children.length === 0) {
            return delete node.children
        }
    })
    return data
}
