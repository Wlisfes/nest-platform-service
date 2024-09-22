import { IncomingHttpHeaders } from 'http'
import { Request } from 'express'
import { tbUser, tbMember } from '@/entities/instance'

/**对接聚合**/
export type Omix<T = Record<any, any>> = T & Record<any, any>

/**获取Promise返回的类型**/
export type PromiseType<T extends Promise<any>> = T extends Promise<infer R> ? R : never

/**Request headers类型**/
export interface OmixHeaders extends Omix<IncomingHttpHeaders> {}

/**Request类型**/
export interface OmixRequest extends Omix<Request> {
    headers: OmixHeaders
    member: Omix<tbMember>
    user: Omix<tbUser>
}

/**自定义错误类型**/
export interface OmixError<T> extends Omix<Error> {
    data: T
}

/**微服务通讯基本字段类型**/
export interface ClientPayload<T> extends Omix {
    eventName: string
    headers: Partial<Headers>
    state: Omix<T>
}
