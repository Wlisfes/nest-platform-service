import { ApiProperty, PickType, IntersectionType, PartialType } from '@nestjs/swagger'
import { OmixColumn, OmixPayload } from '@/interface'
import * as schema from '@/modules/database/schema'

/**添加菜单**/
export class CreateSheetResourceOptions extends IntersectionType(
    PickType(schema.WindowsSheet, ['keyName', 'name', 'router', 'version', 'sort', 'status', 'check']),
    PartialType(PickType(schema.WindowsSheet, ['pid', 'iconName']))
) {}

/**编辑菜单**/
export class UpdateSheetResourceOptions extends IntersectionType(
    PickType(schema.WindowsSheet, ['id', 'keyName', 'name', 'router', 'version', 'sort', 'status', 'check']),
    PartialType(PickType(schema.WindowsSheet, ['pid', 'iconName']))
) {}

/**菜单详情、删除菜单**/
export class BasicSheetOptions extends PickType(schema.WindowsSheet, ['id']) {}

/**菜单资源列表**/
export class ColumnSheetResourceOptions extends PartialType(
    PickType(schema.WindowsSheet, ['name', 'keyName', 'id', 'pid', 'version', 'status', 'router', 'createBy'])
) {}

/**添加按钮权限**/
export class CreateSheetAuthorizeOptions extends IntersectionType(
    PickType(schema.WindowsSheet, ['keyName', 'name', 'version', 'sort', 'status']),
    PartialType(PickType(schema.WindowsSheet, ['pid']))
) {}

/**编辑按钮权限**/
export class UpdateSheetAuthorizeOptions extends IntersectionType(
    PickType(schema.WindowsSheet, ['id', 'keyName', 'name', 'version', 'sort', 'status']),
    PartialType(PickType(schema.WindowsSheet, ['pid']))
) {}

/**操作响应**/
export class SheetBaseResponse {
    @ApiProperty({ description: '响应消息', example: '操作成功' })
    message: string
}

/**菜单、按钮详情响应**/
export class SheetResolverResponse extends schema.WindowsSheet {}

/**菜单列表响应**/
export class SheetColumnResponse {
    @ApiProperty({ description: '列表数据', type: () => [schema.WindowsSheet] })
    list: schema.WindowsSheet[]
}
