import { ApiProperty, PickType, IntersectionType, PartialType } from '@nestjs/swagger'
import { OmixColumnOptions, OmixColumnResponse } from '@/interface'
import * as schema from '@/modules/database/schema'

export class CreateBasicSmsRateOptions extends PickType(schema.WindowsBasicSmsRate, ['code', 'mcc', 'upUsd', 'downUsd', 'remark']) {}

export class UpdateBasicSmsRateOptions extends IntersectionType(
    PickType(schema.WindowsBasicSmsRate, ['keyId', 'code', 'mcc', 'upUsd', 'downUsd']),
    PartialType(PickType(schema.WindowsBasicSmsRate, ['remark']))
) {}

export class ColumnBasicSmsRateOptions extends IntersectionType(
    PickType(OmixColumnOptions, ['page', 'size']),
    PartialType(PickType(schema.WindowsBasicSmsRate, ['code', 'mcc']))
) {}

export class ColumnBasicSmsRateOptionsResponse extends OmixColumnResponse {
    @ApiProperty({ description: '列表数据', type: [schema.WindowsBasicSmsRate] })
    list: schema.WindowsBasicSmsRate[]
}
