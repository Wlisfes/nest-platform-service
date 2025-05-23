import { Inject, ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import * as utils from '@/utils/utils-common'
import * as plugin from '@/utils/utils-plugin'
import * as env from '@/interface/instance.resolver'

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {}

    async catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp()
        const response = ctx.getResponse()
        const request = ctx.getRequest()
        const Result: env.Omix = {
            context: request.headers.context,
            timestamp: utils.moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
            url: request.url,
            method: request.method,
            platform: request.headers.platform,
            code: exception.status ?? HttpStatus.INTERNAL_SERVER_ERROR
        }
        if (exception.response && Array.isArray(exception.response.message)) {
            Result.message = exception.response.message[0]
        } else {
            Result.message = exception.message
        }
        Result.data = exception.options ?? null
        this.logger.error(HttpExceptionFilter.name, plugin.fetchCompiler(request.headers, Result))
        response.status(HttpStatus.OK)
        response.header('Content-Type', 'application/json; charset=utf-8')
        response.send(Result)
    }
}
