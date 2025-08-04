import { PickType, IntersectionType, PartialType } from '@nestjs/swagger'
import { OmixColumn, OmixPayload } from '@/interface'
import { WindowsAccount, WindowsResource } from '@/modules/database/schema'

/**新增菜单资源**/
export class CreateResourceOptions extends IntersectionType(
    PickType(WindowsResource, ['key', 'name', 'router', 'check', 'version', 'sort', 'status']),
    PartialType(PickType(WindowsResource, ['activeRouter', 'iconName', 'pid']))
) {}

/**编辑菜单资源**/
export class UpdateResourceOptions extends IntersectionType(
    PickType(WindowsResource, ['keyId', 'key', 'name', 'router', 'check', 'version', 'sort', 'status']),
    PartialType(PickType(WindowsResource, ['activeRouter', 'iconName', 'pid']))
) {}

/**菜单资源列表**/
export class ColumnResourceOptions extends IntersectionType(PickType(OmixColumn, ['page', 'size'])) {}

/**菜单资源状态变更**/
export class SwitchResourceOptions extends IntersectionType(PickType(OmixPayload, ['keys']), PickType(WindowsResource, ['status'])) {}

/**删除菜单资源**/
export class DeleteResourceOptions extends PickType(OmixPayload, ['keys']) {}
