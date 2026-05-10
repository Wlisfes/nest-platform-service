import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsString, IsOptional, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

/**微服务RPC请求链路信息**/
class BaseRpcRequest {
    @ApiProperty({ description: '日志链路ID', example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' })
    @IsNotEmpty({ message: '日志链路ID必填' })
    @IsString({ message: '日志链路ID必须是字符串' })
    logId: string

    @ApiProperty({ description: '请求时间戳', example: '1715356800000' })
    @IsNotEmpty({ message: '请求时间戳必填' })
    @IsString({ message: '请求时间戳必须是字符串' })
    datetime: string

    @ApiPropertyOptional({ description: '客户端IP', example: '127.0.0.1' })
    @IsOptional()
    @IsString({ message: '客户端IP必须是字符串' })
    ipv4?: string
}

/**微服务RPC载荷基类：携带请求链路信息**/
export class BaseRpcPayload {
    @ApiProperty({ description: '执行链路', type: BaseRpcRequest })
    @IsNotEmpty({ message: '执行链路数据必填' })
    @ValidateNested()
    @Type(() => BaseRpcRequest)
    request: BaseRpcRequest
}
