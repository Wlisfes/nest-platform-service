import { Catch, ExceptionFilter, ArgumentsHost, HttpStatus } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { throwError } from 'rxjs'
import { moment } from '@/utils'

/**微服务异常过滤器：将所有异常统一转换为 RpcException 格式传回调用方**/
@Catch()
export class RpcExceptionFilter extends Logger implements ExceptionFilter {
    @AutoDescriptor
    private output(request: Omix, body: Omix) {
        this.logger.error(body)
        return throwError(() => body)
    }

    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToRpc()
        const Result: Omix = {
            logId: ctx.getData().request?.logId,
            timestamp: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
            code: exception.status ?? HttpStatus.INTERNAL_SERVER_ERROR
        }
        if (exception.response && Array.isArray(exception.response.message)) {
            Result.message = exception.response.message[0]
        } else {
            Result.message = exception.message
        }
        return this.output(ctx.getData().request, Result)
    }
}
