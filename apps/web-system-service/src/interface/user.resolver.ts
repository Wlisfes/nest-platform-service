import { PickType, IntersectionType, PartialType } from '@nestjs/swagger'
import { OmixColumn, OmixPayload } from '@/interface/instance.resolver'
import { SchemaUser } from '@/modules/database/database.schema'

/**新增用户账号**/
export class BaseCreateSystemUser extends PickType(SchemaUser, ['name', 'number', 'phone', 'password']) {}

/**用户账号列表**/
export class BaseColumnSystemUser extends IntersectionType(
    PickType(OmixColumn, ['page', 'size', 'vague', 'startTime', 'endTime']),
    PickType(PartialType(SchemaUser), ['number', 'phone', 'email', 'name', 'status'])
) {}

/**授权登录**/
export class BaseCreateSystemUserAuthorize extends IntersectionType(
    PickType(SchemaUser, ['number', 'password']),
    PickType(OmixPayload, ['code'])
) {}

/**编辑用户账号状态**/
export class BaseSwitchSystemUser extends PickType(SchemaUser, ['uid', 'status']) {}
