import { ApiProperty, PickType, IntersectionType, PartialType } from '@nestjs/swagger'
import { OmixColumnOptions, OmixColumnResponse } from '@/interface'
import * as schema from '@/modules/database/schema'

/**菜单、按钮详情**/
export class SheetPayloadOptions extends PickType(schema.WindowsSheet, ['keyId']) {}

/**菜单、按钮详情响应**/
export class SheetPayloadOptionsResponse extends schema.WindowsSheet {}

/**新增菜单**/
export class CreateSheetOptionsResource extends IntersectionType(
    PickType(schema.WindowsSheet, ['keyName', 'name', 'router', 'version', 'sort', 'status', 'check']),
    PartialType(PickType(schema.WindowsSheet, ['pid', 'iconName']))
) {}

/**编辑菜单**/
export class UpdateSheetOptionsResource extends IntersectionType(
    PickType(schema.WindowsSheet, ['keyId', 'keyName', 'name', 'router', 'version', 'sort', 'status', 'check']),
    PartialType(PickType(schema.WindowsSheet, ['pid', 'iconName']))
) {}

/**分页列表查询**/
export class ColumnSheetOptions extends IntersectionType(
    PickType(OmixColumnOptions, ['page', 'size']),
    PartialType(PickType(schema.WindowsSheet, ['name', 'keyName', 'keyId', 'pid', 'version', 'status', 'router', 'createBy']))
) {}

/**分页列表响应**/
export class ColumnSheetOptionsResponse extends OmixColumnResponse {
    @ApiProperty({ description: '列表数据', type: [schema.WindowsSheet] })
    list: schema.WindowsSheet[]
}

/**新增按钮权限**/
export class CreateSheetOptionsAuthorize extends IntersectionType(
    PickType(schema.WindowsSheet, ['keyName', 'name', 'version', 'sort', 'status']),
    PartialType(PickType(schema.WindowsSheet, ['pid']))
) {}

/**编辑按钮权限**/
export class UpdateSheetOptionsAuthorize extends IntersectionType(
    PickType(schema.WindowsSheet, ['keyId', 'keyName', 'name', 'version', 'sort', 'status']),
    PartialType(PickType(schema.WindowsSheet, ['pid']))
) {}
