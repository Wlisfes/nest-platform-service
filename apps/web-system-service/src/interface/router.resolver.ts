import { PickType, IntersectionType, PartialType } from '@nestjs/swagger'
import { OmixColumn, OmixPayload } from '@/interface/instance.resolver'
import { SchemaRouter } from '@/modules/database/database.schema'

/**新增菜单配置**/
export class BaseCreateSystemRouter extends IntersectionType(
    PickType(SchemaRouter, ['key', 'name', 'iconName', 'check', 'type', 'router', 'pid']),
    PickType(SchemaRouter, ['status', 'version', 'active', 'sort'])
) {}

/**编辑菜单配置**/
export class BaseUpdateSystemRouter extends IntersectionType(
    PickType(SchemaRouter, ['id', 'key', 'name', 'iconName', 'check', 'type', 'router', 'pid']),
    PickType(SchemaRouter, ['status', 'version', 'active', 'sort'])
) {}

/**菜单资源列表**/
export class BaseColumnSystemRouter extends IntersectionType(
    PickType(OmixColumn, ['page', 'size', 'vague']),
    PickType(PartialType(SchemaRouter), ['name', 'key', 'router', 'version', 'createTime', 'modifyTime', 'uid'])
) {}

/**菜单资源详情**/
export class BaseSystemRouterResolver extends PickType(OmixPayload, ['id']) {}
