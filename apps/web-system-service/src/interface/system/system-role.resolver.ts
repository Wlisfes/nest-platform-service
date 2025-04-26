import { PickType, IntersectionType, PartialType } from '@nestjs/swagger'
import { OmixColumn, OmixPayload, OmixBaseOptions } from '@/interface/instance.resolver'
import { SchemaRole } from '@/modules/database/database.schema'

/**根据keyId验证数据: 不存在会抛出异常**/
export interface BaseSystemCheckKeyIdRole extends OmixBaseOptions {
    keyId: string
}

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

/**角色列表**/
export class BaseSystemColumnRole extends IntersectionType(
    PickType(OmixColumn, ['page', 'size', 'vague', 'startTime', 'endTime']),
    PickType(PartialType(SchemaRole), ['name', 'status', 'uid'])
) {}

/**角色详情信息**/
export class BaseSystemRoleResolver extends PickType(SchemaRole, ['keyId']) {}
