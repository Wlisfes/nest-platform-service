import { PickType, IntersectionType, PartialType } from '@nestjs/swagger'
import { OmixColumn } from '@/interface/instance.resolver'
import { SchemaRole } from '@/modules/database/database.schema'

/**新增菜单配置**/
export class BaseCreateSystemRole extends PickType(SchemaRole, ['uids', 'kyes', 'status', 'name']) {}
