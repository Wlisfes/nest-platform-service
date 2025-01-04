import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, Min, IsEnum } from 'class-validator'
import { Type } from 'class-transformer'
import { IsOptional } from '@/decorator/common.decorator'
import * as enums from '@/modules/database/database.enums'

export class OmixColumn {
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

export class OmixPayload extends OmixColumn {
    @ApiProperty({ description: 'ID', example: 1000 })
    @IsNotEmpty({ message: 'ID 必填' })
    id: number

    @ApiProperty({ description: '验证码', example: '495673' })
    @IsNotEmpty({ message: '验证码 必填' })
    code: string

    @ApiProperty({ description: '平台标识: 客户端-client、管理端-administer', enum: enums.CommonFlatform })
    @IsNotEmpty({ message: '平台标识必填' })
    @IsEnum(enums.CommonFlatform, { message: '平台标识格式错误' })
    platform: string
}
