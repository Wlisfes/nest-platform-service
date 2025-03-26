import { PickType, IntersectionType, PartialType } from '@nestjs/swagger'
import { OmixColumn } from '@/interface/instance.resolver'
import { SchemaRole } from '@/modules/database/database.schema'

/**新增角色配置**/
export class BaseCreateSystemRole extends PickType(SchemaRole, ['name']) {}

/**编辑角色配置**/
export class BaseUpdateSystemRole extends PickType(SchemaRole, ['keyId', 'name', 'status']) {}

/**编辑角色状态配置**/
export class BaseSwitchSystemRole extends PickType(SchemaRole, ['keyId', 'status']) {}

/**编辑角色权限配置**/
export class BaseUpdateSystemRoleRouter extends PickType(SchemaRole, ['keyId', 'auxs']) {}

/**编辑角色用户配置**/
export class BaseUpdateSystemRoleUser extends PickType(SchemaRole, ['keyId', 'uids']) {}

/**角色权限列表配置**/
export class BaseColumnSystemRole extends IntersectionType(
    PickType(OmixColumn, ['page', 'size', 'vague', 'startTime', 'endTime']),
    PickType(PartialType(SchemaRole), ['name', 'status', 'uid'])
) {}
