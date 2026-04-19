import { ApiProperty, PickType, IntersectionType, PartialType } from '@nestjs/swagger'
import { OmixColumnOptions, OmixColumnResponse } from '@/interface'
import * as schema from '@/modules/database/schema'

/**批量查询品牌**/
export interface UtilsUidByColumnBrandOptions extends Omix {
    keyIds: Array<number>
    fields?: Array<keyof schema.WindowsBrand>
}

/**新增品牌**/
export class CreateBrandOptions extends PickType(schema.WindowsBrand, ['name', 'document', 'status']) {}

/**编辑品牌**/
export class UpdateBrandOptions extends IntersectionType(
    PickType(schema.WindowsBrand, ['keyId', 'name', 'document']),
    PartialType(PickType(schema.WindowsBrand, ['status']))
) {}

/**品牌详情**/
export class BrandPayloadOptions extends PickType(schema.WindowsBrand, ['keyId']) {}

/**分页列表查询**/
export class ColumnBrandOptions extends IntersectionType(
    PickType(OmixColumnOptions, ['page', 'size']),
    PartialType(PickType(schema.WindowsBrand, ['name', 'status']))
) {}

/**分页列表响应**/
export class ColumnBrandOptionsResponse extends OmixColumnResponse {
    @ApiProperty({ description: '列表数据', type: [schema.WindowsBrand] })
    list: schema.WindowsBrand[]
}

/**状态修改**/
export class UpdateBrandStatusOptions extends PickType(schema.WindowsBrand, ['keyId', 'status']) {}

/**下拉列表响应**/
export class SelectBrandOptionsResponse {
    @ApiProperty({ description: '品牌列表', type: [schema.WindowsBrand] })
    list: schema.WindowsBrand[]
}
