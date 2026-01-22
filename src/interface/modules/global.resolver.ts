import { IncomingHttpHeaders } from 'http'
import { Request, Response } from 'express'

/**Request user类型**/
export interface OmixUser extends Omix {
    uid: string
    name: string
    number: string
    status: string
}

/**Request headers类型**/
export interface OmixHeaders extends Omix<IncomingHttpHeaders> {}

/**Response类型**/
export interface OmixResponse extends Omix<Response> {}

/**Request类型**/
export interface OmixRequest extends Omix<Request> {
    headers: OmixHeaders
    ipv4: string
    user: OmixUser
    permissions?: Array<string>
}
