import { ApiProperty, PickType, IntersectionType, PartialType } from '@nestjs/swagger'
import { OmixColumnOptions, OmixColumnResponse } from '@/interface'
import * as schema from '@/modules/database/schema'

/**职位详情**/
export class PositionPayloadOptions extends PickType(schema.WindowsPosition, ['keyId']) {}

/**职位详情响应**/
export class PositionPayloadOptionsResponse extends schema.WindowsPosition {}

/**新增职位**/
export class CreatePositionOptions extends IntersectionType(
    PickType(schema.WindowsPosition, ['name']),
    PartialType(PickType(schema.WindowsPosition, ['sort']))
) {}

/**编辑职位**/
export class UpdatePositionOptions extends IntersectionType(
    PickType(schema.WindowsPosition, ['keyId', 'name']),
    PartialType(PickType(schema.WindowsPosition, ['sort']))
) {}

/**分页列表查询**/
export class ColumnPositionOptions extends IntersectionType(
    PickType(OmixColumnOptions, ['page', 'size']),
    PartialType(PickType(schema.WindowsPosition, ['name']))
) {}

/**分页列表响应**/
export class ColumnPositionOptionsResponse extends OmixColumnResponse {
    @ApiProperty({ description: '列表数据', type: [schema.WindowsPosition] })
    list: schema.WindowsPosition[]
}

/**删除职位**/
export class DeletePositionOptions extends PickType(schema.WindowsPosition, ['keyId']) {}
