import { knife4jSetup } from 'nest-knife4j'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { cloneDeep } from 'lodash'

/**
 * 获取网关文档服务列表
 */
export async function fetchGatewayOptions() {
    return [
        {
            name: 'web-windows-server',
            prefix: '/api/windows',
            baseUrl: `http://localhost:${process.env.NODE_WEB_WINDOWS_API_PORT}`
        },
        {
            name: 'web-client-server',
            prefix: '/api/client',
            baseUrl: `http://localhost:${process.env.NODE_WEB_CLIENT_API_PORT}`
        }
    ].map(item => {
        return Object.assign(item, {
            swaggerVersion: '1.0.0',
            url: `${item.baseUrl}/api/swagger-json`,
            location: `${item.baseUrl}/api/swagger`
        })
    })
}

/**
 * 网关文档挂载
 * @param app 服务实例
 */
export async function setupProxyMiddleware(app) {
    return await fetchGatewayOptions().then(async data => {
        data.forEach(item => {
            app.use(
                item.prefix,
                createProxyMiddleware({
                    target: item.baseUrl,
                    changeOrigin: true,
                    pathRewrite: path => `${item.prefix}${path}`
                })
            )
        })
        return await knife4jSetup(app, data)
    })
}
