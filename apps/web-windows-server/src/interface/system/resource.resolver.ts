import { PickType, IntersectionType, PartialType } from '@nestjs/swagger'
import { OmixColumn, OmixPayload } from '@/interface'
import * as schema from '@/modules/database/schema'

/**添加菜单资源**/
export class CreateResourceOptions extends IntersectionType(
    PickType(schema.WindowsResource, ['key', 'name', 'router', 'check', 'version', 'sort', 'status']),
    PartialType(PickType(schema.WindowsResource, ['activeRouter', 'icon', 'pid']))
) {}

/**编辑菜单资源**/
export class UpdateResourceOptions extends IntersectionType(CreateResourceOptions, PickType(schema.WindowsResource, ['id'])) {}

/**菜单资源详情**/
export class ResourceResolverOptions extends PickType(schema.WindowsResource, ['id']) {}

/**菜单资源列表**/
export class ColumnResourceOptions extends PartialType(
    PickType(schema.WindowsResource, ['name', 'keyId', 'pid', 'version', 'status', 'router', 'createBy'])
) {}

/**菜单资源状态变更**/
export class SwitchResourceOptions extends IntersectionType(
    PickType(OmixPayload, ['keys']),
    PickType(schema.WindowsResource, ['status'])
) {}

/**删除菜单资源**/
export class DeleteResourceOptions extends PickType(OmixPayload, ['keys']) {}

/**添加操作按钮**/
export class CreateSheetOptions extends PickType(schema.WindowsResourceSheet, ['key', 'pid', 'name', 'version', 'status']) {}

/**编辑操作按钮**/
export class UpdateSheetOptions extends IntersectionType(CreateSheetOptions, PickType(schema.WindowsResourceSheet, ['keyId'])) {}
