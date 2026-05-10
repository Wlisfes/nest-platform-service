import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { moment } from '@/utils'

@Catch()
export class HttpExceptionFilter extends Logger implements ExceptionFilter {
    @AutoDescriptor
    private output(request: Omix, body: Omix) {
        this.logger.error(body)
    }

    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp()
        const response = ctx.getResponse()
        const request = ctx.getRequest()
        const Result: Omix = {
            logId: request.logId,
            timestamp: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
            url: request.url,
            data: exception.options ?? null,
            method: request.method,
            code: exception.status ?? HttpStatus.INTERNAL_SERVER_ERROR
        }
        if (exception.response && Array.isArray(exception.response.message)) {
            Result.message = exception.response.message[0]
        } else {
            Result.message = exception.message
        }
        this.output(request, Result)
        response.status(HttpStatus.OK)
        response.header('Content-Type', 'application/json; charset=utf-8')
        response.send(Result)
    }
}
