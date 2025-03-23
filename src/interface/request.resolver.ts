import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, Min } from 'class-validator'
import { Type } from 'class-transformer'
import { IsOptional } from '@/decorator/common.decorator'

export class OmixColumn {
    @ApiProperty({ description: '分页数', required: false, example: 1 })
    @IsOptional()
    @IsNumber({}, { message: 'page必须是数字' })
    @Min(0, { message: 'page必须大于或等于0' })
    @Type(type => Number)
    page: number = 1

    @ApiProperty({ description: '分页数量', required: false, example: 20 })
    @IsOptional()
    @IsNumber({}, { message: 'size必须是数字' })
    @Min(1, { message: 'size必须大于0' })
    @Type(type => Number)
    size: number = 20

    @ApiPropertyOptional({ description: '模糊关键字' })
    @IsOptional()
    vague: string
}

export class OmixPayload extends OmixColumn {
    @ApiProperty({ description: 'ID', example: '2279965746312249344' })
    @IsNotEmpty({ message: 'ID 必填' })
    id: string

    @ApiProperty({ description: '验证码', example: '495673' })
    @IsNotEmpty({ message: '验证码 必填' })
    code: string
}
