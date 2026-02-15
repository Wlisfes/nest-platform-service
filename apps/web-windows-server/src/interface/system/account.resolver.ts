import { PickType, IntersectionType, PartialType } from '@nestjs/swagger'
import { OmixColumnOptions, OmixPayloadOptions } from '@/interface'
import { WindowsAccount } from '@/modules/database/schema'

/**添加用户账号**/
export class CreateAccountOptions extends IntersectionType(
    PickType(WindowsAccount, ['name', 'number', 'phone', 'password', 'status']),
    PickType(WindowsAccount, ['avatar', 'email'])
) {}

/**用户账号列表**/
export class ColumnAccountOptions extends IntersectionType(
    PickType(OmixColumnOptions, ['page', 'size', 'vague', 'startTime', 'endTime']),
    PickType(PartialType(WindowsAccount), ['number', 'phone', 'email', 'name', 'status'])
) {}

/**编辑账号状态**/
export class UpdateSwitchAccountOptions extends PickType(WindowsAccount, ['uid', 'status']) {}
