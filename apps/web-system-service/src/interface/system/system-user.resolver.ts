import { PickType, IntersectionType, PartialType } from '@nestjs/swagger'
import { OmixColumn, OmixPayload } from '@/interface/instance.resolver'
import { SchemaUser } from '@/modules/database/database.schema'

/**新增用户账号**/
export class BaseSystemUserCreate extends PickType(SchemaUser, ['name', 'number', 'phone', 'password']) {}

/**用户账号列表**/
export class BaseSystemColumnUser extends IntersectionType(
    PickType(OmixColumn, ['page', 'size', 'vague', 'startTime', 'endTime']),
    PickType(PartialType(SchemaUser), ['number', 'phone', 'email', 'name', 'status'])
) {}

/**用户账号登录**/
export class BaseSystemUserTokenAuthorize extends IntersectionType(
    PickType(SchemaUser, ['number', 'password']),
    PickType(OmixPayload, ['code'])
) {}

/**编辑用户账号状态**/
export class BaseSystemSwitchUser extends PickType(SchemaUser, ['uid', 'status']) {}
