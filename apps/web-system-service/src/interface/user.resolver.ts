import { PickType, IntersectionType } from '@nestjs/swagger'
import { OmixColumn, OmixPayload } from '@/interface/instance.resolver'
import { SchemaUser } from '@/modules/database/database.schema'

/**创建系统账号**/
export class CreateSystemUser extends IntersectionType(PickType(SchemaUser, ['username', 'password']), PickType(OmixPayload, ['code'])) {}

export class CreateCustomer extends IntersectionType(PickType(SchemaUser, ['username', 'password']), PickType(OmixPayload, ['code'])) {}
