import { Catch, ExceptionFilter, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'
import { throwError } from 'rxjs'

/**微服务异常过滤器：将所有异常统一转换为 RpcException 格式传回调用方**/
@Catch()
export class RpcExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToRpc()
        /**提取异常信息**/
        let message: string = exception?.message ?? 'Internal server error'
        let status: number = HttpStatus.INTERNAL_SERVER_ERROR
        let options: any = null

        if (exception instanceof HttpException) {
            status = exception.getStatus()
            const response = exception.getResponse()
            if (typeof response === 'object' && response !== null) {
                /**ValidationPipe 的校验错误：response.message 是数组**/
                message = Array.isArray((response as any).message) ? (response as any).message[0] : (response as any).message ?? message
            } else {
                message = response as string
            }
            options = (exception as any).options ?? null
        } else if (exception instanceof RpcException) {
            const error = exception.getError()
            if (typeof error === 'object' && error !== null) {
                message = (error as any).message ?? message
                status = (error as any).status ?? status
            } else {
                message = error as string
            }
        }

        return throwError(() => ({ status, message, options }))
    }
}
