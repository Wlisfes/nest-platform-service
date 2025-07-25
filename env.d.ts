/**通用对象**/
declare type Omix<T = Record<string, any>> = T & Record<string, any>

declare interface EnvOptions {
    /**环境标识**/
    NODE_ENV: 'development' | 'production'
    /**网关服务端口号**/
    NODE_WEB_MAIN_SSR_PORT: number
    /**管理端API服务端口号**/
    NODE_WEB_WINDOWS_API_PORT: number
    /**客户端API服务端口号**/
    NODE_WEB_CLIENT_API_PORT: number
}

/**扩展import.meta.env字段**/
interface ImportMetaEnv extends EnvOptions {}

declare namespace NodeJS {
    interface ProcessEnv extends EnvOptions {}
}
