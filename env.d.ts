/**通用对象**/
declare type Omix<T = Record<string, any>> = T & Record<string, any>

/**从枚举对象中提取所有枚举值的联合类型**/
declare type OmixEnumValues<T> = T[Exclude<keyof T, 'name' | 'value'>] extends { value: infer V } ? V : never

/**OmixResult输出类型**/
declare interface OmixResult<T> extends Omix {
    message: string
    list: Array<Omix<T>>
    total: number
    page: number
    size: number
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
        /**钱包扣费服务端口号**/
        NODE_WEB_WALLET_PORT: number
        /**定时任务服务端口号**/
        NODE_WEB_DATETASK_PORT: number
        NODE_WEB_DATETASK_TCP_PORT: number
        /**网关服务端口号**/
        NODE_WEB_GATEWAY_PORT: number
        /**管理端API服务端口号**/
        NODE_WEB_WINDOWS_PORT: number
        /**客户端API服务端口号**/
        NODE_WEB_CLIENT_PORT: number
    }
}
