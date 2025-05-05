import { PickType, IntersectionType } from '@nestjs/swagger'
import { OmixColumn, OmixPayload } from '@/interface/instance.resolver'
import { SchemaRole } from '@/modules/database/database.schema'

/**新增角色**/
export class BaseSystemRoleCreate extends PickType(SchemaRole, ['name', 'comment', 'status']) {}

/**编辑角色**/
export class BaseSystemRoleUpdate extends PickType(SchemaRole, ['keyId', 'comment', 'name', 'status']) {}

/**编辑角色数据权限**/
export class BaseSystemRoleModelUpdate extends PickType(SchemaRole, ['keyId', 'model']) {}

/**角色详情信息**/
export class BaseSystemRoleResolver extends PickType(SchemaRole, ['keyId']) {}

/**角色关联用户列表**/
export class BaseSystemJoinColumnRoleUser extends IntersectionType(
    PickType(SchemaRole, ['keyId']),
    PickType(OmixColumn, ['page', 'size', 'vague'])
) {}

/**角色关联用户、移除角色关联用户**/
export class BaseSystemJoinRoleUser extends PickType(SchemaRole, ['keyId', 'uid']) {}

/**角色关联菜单**/
export class BaseSystemJoinRoleRouter extends IntersectionType(PickType(SchemaRole, ['keyId']), PickType(OmixPayload, ['keys'])) {}
