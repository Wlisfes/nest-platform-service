import winston from 'winston'

/**HMR: 关闭上一次热更新遗留的应用实例，确保端口释放**/
export async function closeHotModule(mod: any) {
    if (mod.hot?.data?.app) {
        return await mod.hot.data.app.close()
    }
}

/**HMR: 注册当前应用实例到热更新模块，同时启用优雅关闭钩子**/
export function setupHotModule(mod: any, app: any) {
    app.enableShutdownHooks()
    if (mod.hot) {
        mod.hot.accept()
        mod.hot.dispose((data: any) => {
            data.app = app
            /**清理 winston transports，防止 DailyRotateFile 事件监听器累积**/
            winston.loggers.loggers.forEach(logger => {
                logger.close()
            })
        })
    }
}
