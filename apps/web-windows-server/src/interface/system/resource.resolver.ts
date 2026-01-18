import { PickType, IntersectionType, PartialType } from '@nestjs/swagger'
import { OmixColumn, OmixPayload } from '@/interface'
import { WindowsResource, WindowsResourceSheet, WindowsResourceApifox } from '@/modules/database/schema'

/**新增菜单资源**/
export class CreateResourceOptions extends IntersectionType(
    PickType(WindowsResource, ['key', 'name', 'router', 'check', 'version', 'sort', 'status']),
    PartialType(PickType(WindowsResource, ['activeRouter', 'icon', 'pid']))
) {}

/**编辑菜单资源**/
export class UpdateResourceOptions extends IntersectionType(CreateResourceOptions, PickType(WindowsResource, ['keyId'])) {}

/**菜单资源详情**/
export class ResourceResolverOptions extends PickType(WindowsResource, ['keyId']) {}

/**菜单资源列表**/
export class ColumnResourceOptions extends PartialType(
    PickType(WindowsResource, ['name', 'keyId', 'pid', 'version', 'status', 'router', 'createBy'])
) {}

/**菜单资源状态变更**/
export class SwitchResourceOptions extends IntersectionType(PickType(OmixPayload, ['keys']), PickType(WindowsResource, ['status'])) {}

/**删除菜单资源**/
export class DeleteResourceOptions extends PickType(OmixPayload, ['keys']) {}

/**新增操作按钮**/
export class CreateSheetOptions extends PickType(WindowsResourceSheet, ['key', 'pid', 'name', 'version', 'status']) {}

/**编辑操作按钮**/
export class UpdateSheetOptions extends IntersectionType(CreateSheetOptions, PickType(WindowsResourceSheet, ['keyId'])) {}
