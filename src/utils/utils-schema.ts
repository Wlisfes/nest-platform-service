import { Omix } from '@/interface/global.resolver'
import * as utils from '@/utils/utils-common'

/**枚举描述转换**/
export function comment(name: string, data: Omix) {
    const text = Object.values(data)
        .map(item => `${item.name}-${item.value}`)
        .join('、')
    return `${name}：${text}`
}

/**日期时间转换**/
export const DateTimeTransform = {
    from: s => utils.moment(s).format('YYYY-MM-DD HH:mm:ss'),
    to: s => s
}

/**数组字符串转换**/
export const ArrayStringTransform = {
    from: (s: string) => {
        return utils.isEmpty(s) ? [] : s.toString().split(',')
    },
    to: (s: Array<string>) => {
        return s.length === 0 ? null : s.join(',')
    }
}

/**Json字符串转换**/
export const JsonStringTransform = {
    from: (s: string) => {
        return JSON.parse(s ?? '{}')
    },
    to: (s: Omix) => {
        return s ? JSON.stringify(s) : null
    }
}
