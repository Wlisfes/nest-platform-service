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

/**操作按钮详情**/
export class SheetResolverOptions extends PickType(WindowsResourceSheet, ['keyId']) {}

/**操作按钮列表**/
export class ColumnSheetOptions extends IntersectionType(
    PickType(OmixColumn, ['page', 'size', 'vague', 'startTime', 'endTime']),
    PartialType(PickType(WindowsResourceSheet, ['pid', 'keyId', 'key', 'name', 'version', 'status', 'createBy']))
) {}

/**操作按钮状态变更**/
export class SwitchSheetOptions extends IntersectionType(PickType(OmixPayload, ['keys']), PickType(WindowsResourceSheet, ['status'])) {}

/**删除操作按钮**/
export class DeleteSheetOptions extends PickType(OmixPayload, ['keys']) {}

/**新增接口权限**/
export class CreateApifoxOptions extends PickType(WindowsResourceApifox, ['pid', 'name', 'version', 'path', 'method', 'status']) {}

/**编辑接口权限**/
export class UpdateApifoxOptions extends IntersectionType(CreateApifoxOptions, PickType(WindowsResourceApifox, ['keyId'])) {}

/**接口权限详情**/
export class ApifoxResolverOptions extends PickType(WindowsResourceApifox, ['keyId']) {}

/**接口权限列表**/
export class ColumnApifoxOptions extends IntersectionType(
    PickType(OmixColumn, ['page', 'size', 'vague', 'startTime', 'endTime']),
    PartialType(PickType(WindowsResourceApifox, ['pid', 'keyId', 'name', 'version', 'path', 'method', 'status', 'createBy']))
) {}

/**接口权限状态变更**/
export class SwitchApifoxOptions extends IntersectionType(PickType(OmixPayload, ['keys']), PickType(WindowsResourceApifox, ['status'])) {}

/**删除接口权限**/
export class DeleteApifoxOptions extends PickType(OmixPayload, ['keys']) {}
