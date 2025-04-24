import { PickType, IntersectionType, PartialType } from '@nestjs/swagger'
import { OmixColumn } from '@/interface/instance.resolver'
import { SchemaRole } from '@/modules/database/database.schema'

/**新增角色**/
export class BaseSystemRoleCreate extends PickType(SchemaRole, ['name']) {}

/**编辑角色**/
export class BaseSystemRoleUpdate extends PickType(SchemaRole, ['keyId', 'name', 'status']) {}

/**编辑角色状态**/
export class BaseSystemSwitchRole extends PickType(SchemaRole, ['keyId', 'status']) {}

/**编辑角色规则**/
export class BaseSystemUpdateRoleRules extends PickType(SchemaRole, ['keyId']) {}

/**编辑角色用户**/
export class BaseSystemUpdateRoleUser extends PickType(SchemaRole, ['keyId']) {}

/**角色列表**/
export class BaseSystemColumnRole extends IntersectionType(
    PickType(OmixColumn, ['page', 'size', 'vague', 'startTime', 'endTime']),
    PickType(PartialType(SchemaRole), ['name', 'status', 'uid'])
) {}
