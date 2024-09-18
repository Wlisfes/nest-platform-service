import { IncomingHttpHeaders } from 'http'

/**对接聚合**/
export type Omix<T = Record<any, any>> = T & Record<any, any>

/**Request headers类型**/
export type Headers = Omix<IncomingHttpHeaders>

/**获取Promise返回的类型**/
export type PromiseType<T extends Promise<any>> = T extends Promise<infer R> ? R : never

/**自定义错误类型**/
export interface CustomizeError<T> extends Error {
    data: T
}

/**微服务通讯基本字段类型**/
export interface ClientPayload<T> extends Omix {
    eventName: string
    headers: Partial<Headers>
    state: Omix<T>
}
