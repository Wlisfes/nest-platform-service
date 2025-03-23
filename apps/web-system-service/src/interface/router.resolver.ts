import { PickType, IntersectionType } from '@nestjs/swagger'
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
