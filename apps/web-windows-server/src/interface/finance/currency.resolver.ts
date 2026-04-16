import { ApiProperty, PickType, IntersectionType, PartialType } from '@nestjs/swagger'
import { OmixColumnOptions, OmixColumnResponse } from '@/interface'
import * as schema from '@/modules/database/schema'

/**分页列表查询**/
export class ColumnCurrencyOptions extends IntersectionType(
    PickType(OmixColumnOptions, ['page', 'size']),
    PartialType(PickType(schema.WindowsCurrency, ['name', 'status']))
) {}

/**分页列表响应**/
export class ColumnCurrencyOptionsResponse extends OmixColumnResponse {
    @ApiProperty({ description: '列表数据', type: [schema.WindowsCurrency] })
    list: schema.WindowsCurrency[]
}

/**状态修改**/
export class UpdateCurrencyStatusOptions extends PickType(schema.WindowsCurrency, ['keyId', 'status']) {}

/**下拉列表响应**/
export class SelectCurrencyOptionsResponse {
    @ApiProperty({ description: '币种列表', type: [schema.WindowsCurrency] })
    list: schema.WindowsCurrency[]
}
