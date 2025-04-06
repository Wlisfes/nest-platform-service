import { PickType, IntersectionType, PartialType } from '@nestjs/swagger'
import { OmixColumn } from '@/interface/instance.resolver'
import { SchemaRole } from '@/modules/database/database.schema'

/**新增角色**/
export class BaseCreateSystemRole extends PickType(SchemaRole, ['name']) {}

/**编辑角色**/
export class BaseUpdateSystemRole extends PickType(SchemaRole, ['keyId', 'name', 'status']) {}

/**编辑角色状态**/
export class BaseStateSystemRole extends PickType(SchemaRole, ['keyId', 'status']) {}

/**编辑角色**/
export class BaseUpdateSystemRoleAuthorize extends PickType(SchemaRole, ['keyId', 'auxs']) {}

/**编辑角色用户**/
export class BaseUpdateSystemRoleUser extends PickType(SchemaRole, ['keyId', 'uids']) {}

/**角色列表**/
export class BaseColumnSystemRole extends IntersectionType(
    PickType(OmixColumn, ['page', 'size', 'vague', 'startTime', 'endTime']),
    PickType(PartialType(SchemaRole), ['name', 'status', 'uid'])
) {}
