import { IncomingHttpHeaders } from 'http'
import { Request, Response } from 'express'
import { SchemaUser } from '@/modules/database/database.schema'

/**对接聚合**/
export type Omix<T = Record<any, any>> = T & Record<any, any>

/**获取Promise返回的类型**/
export type PromiseType<T extends Promise<any>> = T extends Promise<infer R> ? R : never

/**Request headers类型**/
export interface OmixHeaders extends Omix<IncomingHttpHeaders> {}

/**Response类型**/
export interface OmixResponse extends Omix<Response> {}

/**Request类型**/
export interface OmixRequest extends Omix<Request> {
    headers: OmixHeaders
    user: Omix<SchemaUser>
    ipv4: string
    platform: 'client' | 'manager'
}
