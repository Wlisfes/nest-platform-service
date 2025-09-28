import { PickType, IntersectionType, PartialType } from '@nestjs/swagger'
import { OmixColumn, OmixPayload } from '@/interface'
import { WindowsAccount } from '@/modules/database/schema'

/**账户登录**/
export class AccountTokenOptions extends IntersectionType(
    PickType(WindowsAccount, ['number', 'password']),
    PickType(OmixPayload, ['code'])
) {}
