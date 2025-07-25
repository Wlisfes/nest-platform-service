import { Inject, Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { getClientIp } from 'request-ip'
import { Omix } from '@/interface/instance.resolver'
import * as utils from '@/utils/utils-common'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {}

    async use(request: Omix<Request>, response: Response, next: NextFunction) {
        const { baseUrl, method, body, query, params, headers } = request
        const clientIp = getClientIp(request)
        const start = Date.now()
        const context = await utils.fetchIntNumber({ random: true, bit: 32 })
        const ip = ['localhost', '::1', '::ffff:127.0.0.1'].includes(clientIp) ? '127.0.0.1' : clientIp.replace(/^.*:/, '')
        request.ipv4 = ip
        request.headers.datetime = start.toString()
        request.headers.context = context.toString()
        response.on('finish', () => {
            /**结束日志 endTime**/
            this.logger.info(LoggerMiddleware.name, {
                context: context.toString(),
                duration: `${Date.now() - start}ms`,
                log: {
                    url: baseUrl,
                    method,
                    body,
                    query,
                    params,
                    ip: ip,
                    host: headers.host ?? '',
                    origin: headers.origin ?? '',
                    referer: headers.referer ?? '',
                    platform: headers.platform,
                    device: headers['user-agent'] ?? '',
                    user: request.user ? utils.pick(request.user, ['name', 'uid']) : {}
                }
            })
        })
        return next()
    }
}
