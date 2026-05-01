import { ApiProperty, PickType, IntersectionType, PartialType } from '@nestjs/swagger'
import { OmixColumnOptions, OmixColumnResponse } from '@/interface'
import * as schema from '@/modules/database/schema'

/**分页列表查询**/
export class ColumnCountryOptions extends IntersectionType(
    PickType(OmixColumnOptions, ['page', 'size']),
    PartialType(PickType(schema.WindowsCountry, ['cnName', 'status', 'mcc']))
) {}

/**分页列表响应**/
export class ColumnCountryOptionsResponse extends OmixColumnResponse {
    @ApiProperty({ description: '列表数据', type: [schema.WindowsCountry] })
    list: schema.WindowsCountry[]
}

/**状态修改**/
export class UpdateCountryStatusOptions extends PickType(schema.WindowsCountry, ['keyId', 'status']) {}

/**下拉列表响应**/
export class SelectCountryOptionsResponse {
    @ApiProperty({ description: '国家/地区列表', type: [schema.WindowsCountry] })
    list: schema.WindowsCountry[]
}
