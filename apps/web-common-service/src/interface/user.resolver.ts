import { PickType, IntersectionType } from '@nestjs/swagger'
import { OmixColumn, OmixPayload } from '@/interface/instance.resolver'
import { SchemaUser } from '@/modules/database/database.schema'

/**创建系统账号**/
export class CreateSystemUser extends PickType(SchemaUser, ['account', 'password', 'nickname']) {}

/**创建基本账号**/
export class CreateCustomer extends PickType(SchemaUser, ['nickname', 'email']) {}

/**注册基本账号**/
export class RegisterCustomer extends IntersectionType(
    PickType(SchemaUser, ['password', 'nickname', 'email']),
    PickType(OmixPayload, ['code'])
) {}

/**账号登录**/
export class WriteAuthorize extends IntersectionType(PickType(SchemaUser, ['password', 'account']), PickType(OmixPayload, ['code'])) {}
