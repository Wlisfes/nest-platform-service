import { Inject, Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { getClientIp } from 'request-ip'
import { Omix } from '@/interface/instance.resolver'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    async use(request: Omix<Request>, response: Response, next: NextFunction) {
        const clientIp = getClientIp(request)
        const ip = ['localhost', '::1', '::ffff:127.0.0.1'].includes(clientIp) ? '127.0.0.1' : clientIp.replace(/^.*:/, '')

        request.headers.ip = ip
        request.headers.browser = request.useragent.browser
        request.headers.platform = request.useragent.platform
        return next()
    }
}
