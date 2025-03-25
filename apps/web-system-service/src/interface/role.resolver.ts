import { PickType, IntersectionType, PartialType } from '@nestjs/swagger'
import { OmixColumn } from '@/interface/instance.resolver'
import { SchemaRole } from '@/modules/database/database.schema'

/**新增菜单配置**/
export class BaseCreateSystemRole extends PickType(SchemaRole, ['uids', 'kyes', 'status', 'name']) {}

/**编辑角色**/
export class BaseUpdateSystemRole extends PickType(SchemaRole, ['keyId', 'name', 'status']) {}

/**编辑角色权限**/
export class BaseUpdateSystemRoleRouter extends PickType(SchemaRole, ['keyId', 'kyes']) {}

/**编辑角色用户**/
export class BaseUpdateSystemRoleUser extends PickType(SchemaRole, ['keyId', 'uids']) {}

/**角色权限列表**/
export class BaseColumnSystemRole extends IntersectionType(
    PickType(OmixColumn, ['page', 'size', 'vague', 'startTime', 'endTime']),
    PickType(PartialType(SchemaRole), ['name', 'status', 'uid'])
) {}
