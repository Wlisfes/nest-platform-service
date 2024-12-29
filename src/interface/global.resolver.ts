import { IncomingHttpHeaders } from 'http'
import { Request } from 'express'

/**对接聚合**/
export type Omix<T = Record<any, any>> = T & Record<any, any>

/**获取Promise返回的类型**/
export type PromiseType<T extends Promise<any>> = T extends Promise<infer R> ? R : never

/**Request headers类型**/
export interface OmixHeaders extends Omix<IncomingHttpHeaders> {}

/**Request类型**/
export interface OmixRequest extends Omix<Request> {
    headers: OmixHeaders
}
