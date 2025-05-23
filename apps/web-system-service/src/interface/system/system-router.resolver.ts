import { PickType, IntersectionType, PartialType } from '@nestjs/swagger'
import { OmixColumn, OmixPayload } from '@/interface/instance.resolver'
import { SchemaRouter } from '@/modules/database/database.schema'

/**新增菜单**/
export class BaseSystemRouterCreate extends IntersectionType(
    PickType(SchemaRouter, ['key', 'name', 'iconName', 'check', 'type', 'router', 'pid']),
    PickType(SchemaRouter, ['status', 'method', 'version', 'active', 'sort'])
) {}

/**编辑菜单**/
export class BaseSystemRouterUpdate extends IntersectionType(
    PickType(SchemaRouter, ['keyId', 'key', 'name', 'iconName', 'check', 'type', 'router', 'pid']),
    PickType(SchemaRouter, ['status', 'version', 'active', 'sort'])
) {}

/**编辑菜单状态**/
export class BaseSystemSwitchRouter extends IntersectionType(PickType(OmixPayload, ['keys']), PickType(SchemaRouter, ['status'])) {}

/**菜单列表**/
export class BaseSystemColumnRouter extends IntersectionType(
    PickType(OmixColumn, ['page', 'size', 'vague', 'startTime', 'endTime']),
    PickType(PartialType(SchemaRouter), ['name', 'key', 'router', 'version', 'uid', 'pid'])
) {}

/**菜单详情**/
export class BaseSystemRouterResolver extends PickType(SchemaRouter, ['keyId']) {}
