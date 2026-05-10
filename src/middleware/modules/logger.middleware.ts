import { Inject, Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { fetchIPClient } from '@/utils'
import { Logger } from 'winston'
import { v4 } from 'uuid'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {}

    async use(request: Omix<Request>, response: Response, next: NextFunction) {
        const date = Date.now()
        const logs = { logId: v4(), datetime: date.toString(), ipv4: fetchIPClient(request) }
        request.logs = logs
        request.ipv4 = logs.ipv4
        request.logId = logs.logId
        request.datetime = logs.datetime
        response.on('finish', () => {
            this.logger.info(LoggerMiddleware.name, {
                logId: request.logId,
                duration: `${Date.now() - date}ms`,
                log: {
                    url: request.originalUrl,
                    method: request.method,
                    body: request.body,
                    query: request.query,
                    params: request.params,
                    ip: request.ipv4,
                    host: request.headers.host ?? '',
                    origin: request.headers.origin ?? '',
                    referer: request.headers.referer ?? '',
                    device: request.headers['user-agent'] ?? ''
                }
            })
        })
        return next()
    }
}
