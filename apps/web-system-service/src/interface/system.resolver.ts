import { PickType, IntersectionType } from '@nestjs/swagger'
import { OmixColumn, OmixPayload } from '@/interface/instance.resolver'
import { SchemaSystem } from '@/modules/database/database.schema'

/**创建系统配置**/
export class BaseCreateSystem extends IntersectionType(
    PickType(SchemaSystem, ['key', 'name', 'icon', 'check', 'source', 'router', 'pid']),
    PickType(SchemaSystem, ['status', 'version', 'active', 'sort'])
) {}
