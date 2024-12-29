import { Inject, Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { getClientIp } from 'request-ip'
import { Omix } from '@/interface/instance.resolver'
import * as utils from '@/utils/utils-common'
import * as web from '@/config/web-common'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {}

    async use(request: Omix<Request>, response: Response, next: NextFunction) {
        const clientIp = getClientIp(request)
        const start = Date.now()
        const context = utils.fetchIntNumber({ random: true, bit: 32 })
        const ip = ['localhost', '::1', '::ffff:127.0.0.1'].includes(clientIp) ? '127.0.0.1' : clientIp.replace(/^.*:/, '')

        /**起始日志 startTime**/
        this.logger.info(LoggerMiddleware.name, {
            [web.WEB_COMMON_HEADER_CONTEXTID]: context.toString(),
            duration: '0ms',
            log: {
                url: request.baseUrl,
                method: request.method,
                body: request.body,
                query: request.query,
                params: request.params,
                host: request.headers.host ?? '',
                ip: ip,
                origin: request.headers.origin ?? '',
                referer: request.headers.referer ?? '',
                ['user-agent']: request.headers['user-agent'] ?? '',
                authorization: request.headers[web.WEB_COMMON_HEADER_AUTHORIZE] ?? ''
            }
        })

        request.headers.ip = ip
        request.headers.browser = request.useragent.browser
        request.headers.platform = request.useragent.platform
        request.headers[web.WEB_COMMON_HEADER_STARTTIME] = start.toString()
        request.headers[web.WEB_COMMON_HEADER_CONTEXTID] = context.toString()
        response.on('finish', () => {
            /**结束日志 endTime**/
            this.logger.info(LoggerMiddleware.name, {
                [web.WEB_COMMON_HEADER_CONTEXTID]: context.toString(),
                duration: `${Date.now() - start}ms`,
                log: {
                    url: request.baseUrl,
                    method: request.method,
                    body: request.body,
                    query: request.query,
                    params: request.params,
                    host: request.headers.host ?? '',
                    ip: ip,
                    origin: request.headers.origin ?? '',
                    referer: request.headers.referer ?? '',
                    ['user-agent']: request.headers['user-agent'] ?? '',
                    authorization: request.headers[web.WEB_COMMON_HEADER_AUTHORIZE] ?? ''
                }
            })
        })
        return next()
    }
}
