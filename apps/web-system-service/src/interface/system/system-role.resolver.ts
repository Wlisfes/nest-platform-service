import { PickType, IntersectionType, PartialType } from '@nestjs/swagger'
import { OmixColumn, OmixPayload } from '@/interface/instance.resolver'
import { SchemaRole } from '@/modules/database/database.schema'

/**新增角色**/
export class BaseSystemRoleCreate extends PickType(SchemaRole, ['name']) {}

/**编辑角色**/
export class BaseSystemRoleUpdate extends PickType(SchemaRole, ['keyId', 'name', 'status']) {}

/**编辑角色状态**/
export class BaseSystemSwitchRole extends PickType(SchemaRole, ['keyId', 'status']) {}

/**编辑角色权限规则**/
export class BaseSystemUpdateRoleRules extends IntersectionType(PickType(SchemaRole, ['keyId']), PickType(OmixPayload, ['keys'])) {}

/**编辑角色用户**/
export class BaseSystemUpdateRoleUser extends IntersectionType(PickType(SchemaRole, ['keyId']), PickType(OmixPayload, ['keys'])) {}

/**角色列表**/
export class BaseSystemColumnRole extends IntersectionType(
    PickType(OmixColumn, ['page', 'size', 'vague', 'startTime', 'endTime']),
    PickType(PartialType(SchemaRole), ['name', 'status', 'uid'])
) {}
