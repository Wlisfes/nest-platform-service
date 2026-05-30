import { ApiProperty, PickType, IntersectionType } from '@nestjs/swagger'
import { IsOptional, IsEnum } from 'class-validator'
import { OmixColumnOptions, OmixColumnResponse } from '@/interface'
import { schema } from '@/modules/database/database.service'
import { withKeys, withComment } from '@/modules/database/database.adapter'
import * as enums from '@/modules/database/enums'

/**报价查询-分页列表查询**/
export class SmsSaturationColumnOptions extends OmixColumnOptions {
    @ApiProperty({ required: false, description: '客户ID', example: 1008601 })
    @IsOptional()
    clientId: number

    @ApiProperty({ required: false, description: '应用ID', example: '09SYfmEt' })
    @IsOptional()
    appId: string

    @ApiProperty({ required: false, description: '国家/地区编码', example: '86' })
    @IsOptional()
    code: string

    @ApiProperty({
        required: false,
        description: withComment('状态', enums.CHUNK_SMS_FORMOSAN_STATUS),
        example: enums.CHUNK_SMS_FORMOSAN_STATUS.effective.value
    })
    @IsOptional()
    @IsEnum(withKeys(enums.CHUNK_SMS_FORMOSAN_STATUS), { message: '状态格式错误' })
    status: string
}

/**报价查询-分页列表响应**/
export class SmsSaturationColumnOptionsResponse extends OmixColumnResponse {
    @ApiProperty({ description: '列表数据', type: [schema.TbSmsAppFormosan] })
    list: schema.TbSmsAppFormosan[]
}
