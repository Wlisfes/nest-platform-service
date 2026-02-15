import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, Min, IsArray, IsString, IsOptional } from 'class-validator'
import { Type } from 'class-transformer'
import { IsDateCustomize } from '@/decorator'

export class OmixColumnOptions {
    @ApiProperty({ description: '分页数', required: false, example: 1 })
    @IsNumber({}, { message: 'page必须是数字' })
    @Min(1, { message: 'page必须大于或等于0' })
    @Type(type => Number)
    page: number = 1

    @ApiProperty({ description: '分页数量', required: false, example: 20 })
    @IsNumber({}, { message: 'size必须是数字' })
    @Min(1, { message: 'size必须大于0' })
    @Type(type => Number)
    size: number = 20

    @ApiPropertyOptional({ description: '开始时间' })
    @IsOptional()
    @IsDateCustomize()
    startTime: string

    @ApiPropertyOptional({ description: '结束时间' })
    @IsOptional()
    @IsDateCustomize()
    endTime: string

    @ApiPropertyOptional({ description: '模糊关键字' })
    @IsOptional()
    vague: string
}

export class OmixColumnResponse {
    @ApiProperty({ description: '分页数', example: 1 })
    page: number = 1

    @ApiProperty({ description: '分页数量', example: 20 })
    size: number = 20

    @ApiProperty({ description: '总数量', example: 0 })
    total: number = 0
}

export class OmixPayloadOptions extends OmixColumnOptions {
    @ApiProperty({ description: 'keyId', example: '2279965746312249344' })
    @IsNotEmpty({ message: 'keyId 必填' })
    keyId: number

    @ApiProperty({ description: 'keyId列表', example: [] })
    @IsNotEmpty({ message: 'keys 必填' })
    @IsArray({ message: 'keys 必须为Array<string>格式' })
    keys: Array<number>

    @ApiProperty({ description: '验证码', example: '495673' })
    @IsNotEmpty({ message: '验证码 必填' })
    code: string
}

export class OmixPayloadResponse {
    @ApiProperty({ description: '响应消息', example: '操作成功' })
    message: string
}
