import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, Min } from 'class-validator'
import { Type } from 'class-transformer'
import { IsOptional } from '@/decorator/common.decorator'

export class OmixColumnPayload {
    @ApiProperty({ description: '分页偏移量', required: false, example: 0 })
    @IsOptional()
    @IsNumber({}, { message: 'offset必须是数字' })
    @Min(0, { message: 'offset必须大于或等于0' })
    @Type(type => Number)
    offset: number = 0

    @ApiProperty({ description: '分页数量', required: false, example: 10 })
    @IsOptional()
    @IsNumber({}, { message: 'limit必须是数字' })
    @Min(1, { message: 'limit必须大于0' })
    @Type(type => Number)
    limit: number = 10

    @ApiPropertyOptional({ description: '关键字' })
    @IsOptional()
    keyword: string
}

export class OmixPayload extends OmixColumnPayload {
    @ApiProperty({ description: 'ID', example: 1000 })
    @IsNotEmpty({ message: 'ID 必填' })
    id: number

    @ApiProperty({ description: '验证码', example: '495673' })
    @IsNotEmpty({ message: '验证码 必填' })
    code: string
}

export class OmixNotice {
    @ApiProperty({ description: '状态码', example: 200 })
    code: number

    @ApiProperty({ description: '时间', example: '2023-09-21 23:49:42' })
    timestamp: number

    @ApiProperty({ description: '提示信息', example: 'success' })
    message: string

    @ApiProperty({ description: '响应', example: null })
    data: Object
}
