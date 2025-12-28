import { PickType, IntersectionType, PartialType } from '@nestjs/swagger'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsNotEmpty, IsArray, ArrayNotEmpty, Length, IsEnum, IsNumber, IsOptional } from 'class-validator'
import { OmixColumn, OmixPayload } from '@/interface'
import { WindowsAccount } from '@/modules/database/schema'
import { withExtract, withComment } from '@/modules/database/database.adapter'
import * as enums from '@/modules/database/enums'

/**固定枚举类型**/
export const COMMON_CHUNK = {
    [enums.CHUNK_WINDOWS_RESOUREC_STATUS.value]: {
        name: enums.CHUNK_WINDOWS_RESOUREC_STATUS.name,
        value: enums.CHUNK_WINDOWS_RESOUREC_STATUS.value,
        columns: withExtract(enums.CHUNK_WINDOWS_RESOUREC_STATUS)
    }
}

/**通用下拉字典**/
export class ChunkSelectOptions {
    @ApiProperty({ description: withComment('枚举类型', COMMON_CHUNK) })
    @IsNotEmpty({ message: '枚举类型必填' })
    @ArrayNotEmpty({ message: '枚举类型不能为空' })
    @IsEnum(Object.keys(COMMON_CHUNK), { each: true, message: '枚举类型格式错误' })
    type: Array<keyof typeof COMMON_CHUNK>
}
