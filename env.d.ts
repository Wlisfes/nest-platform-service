import { IncomingHttpHeaders } from 'http'
import { Request, Response } from 'express'

declare global {
    declare type Key = string | number | symbol
    declare type Schema<K extends Key, T = any> = Record<K, T>
    /**通用对象**/
    declare type Omix<T = Schema> = T & Schema

    /**Request headers类型**/
    declare interface OmixHeaders extends Omix<IncomingHttpHeaders> {}

    /**Response类型**/
    declare interface OmixResponse extends Omix<Response> {}

    /**Request类型**/
    declare interface OmixRequest extends Omix<Request> {
        headers: OmixHeaders
        ipv4: string
        user: Omix
    }

    /**jwt解析**/
    declare interface JwtParserOptions extends Omix {
        message: string
        code: number
    }

    /**jwt加密**/
    declare interface JwtSecretOptions extends Omix {
        expires: number
        message: string
        code: number
    }

    declare namespace NodeJS {
        /**扩展env类型**/
        interface ProcessEnv extends Omix {
            /**环境标识**/
            NODE_ENV: 'development' | 'production'
            /**网关服务端口号**/
            NODE_WEB_MAIN_SSR_PORT: number
            /**管理端API服务端口号**/
            NODE_WEB_WINDOWS_API_PORT: number
            /**客户端API服务端口号**/
            NODE_WEB_CLIENT_API_PORT: number
        }
    }
}
