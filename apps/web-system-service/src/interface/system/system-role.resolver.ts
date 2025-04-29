import { PickType, IntersectionType, PartialType } from '@nestjs/swagger'
import { OmixColumn, OmixPayload } from '@/interface/instance.resolver'
import { SchemaRole } from '@/modules/database/database.schema'

/**新增角色**/
export class BaseSystemRoleCreate extends PickType(SchemaRole, ['name', 'comment', 'status', 'model']) {}

/**编辑角色**/
export class BaseSystemRoleUpdate extends PickType(SchemaRole, ['keyId', 'comment', 'name', 'status', 'model']) {}

/**编辑角色状态**/
export class BaseSystemSwitchRole extends PickType(SchemaRole, ['keyId', 'status']) {}

/**编辑角色权限规则**/
export class BaseSystemUpdateRoleRules extends IntersectionType(PickType(SchemaRole, ['keyId']), PickType(OmixPayload, ['keys'])) {}

/**编辑角色用户**/
export class BaseSystemUpdateRoleUser extends IntersectionType(PickType(SchemaRole, ['keyId']), PickType(OmixPayload, ['keys'])) {}

/**角色详情信息**/
export class BaseSystemRoleResolver extends PickType(SchemaRole, ['keyId']) {}
