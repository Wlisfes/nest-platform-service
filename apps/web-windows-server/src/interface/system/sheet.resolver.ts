import { PickType, IntersectionType, PartialType } from '@nestjs/swagger'
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
export class BasicSheetResourceOptions extends PickType(schema.WindowsSheet, ['id']) {}

/**菜单资源列表**/
export class ColumnSheetResourceOptions extends PartialType(
    PickType(schema.WindowsSheet, ['name', 'keyName', 'id', 'pid', 'version', 'status', 'router', 'createBy'])
) {}
