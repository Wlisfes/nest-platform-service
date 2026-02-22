import { ApiProperty, PickType, IntersectionType, PartialType } from '@nestjs/swagger'
import { OmixColumnOptions, OmixPayloadOptions, OmixColumnResponse } from '@/interface'
import * as schema from '@/modules/database/schema'

/**账号详情**/
export class AccountPayloadOptions extends PickType(schema.WindowsAccount, ['keyId']) {}

/**账号详情响应**/
export class AccountPayloadOptionsResponse extends schema.WindowsAccount {}

/**添加用户账号**/
export class CreateAccountOptions extends IntersectionType(
    PickType(schema.WindowsAccount, ['name', 'number', 'phone', 'password', 'status']),
    PickType(schema.WindowsAccount, ['avatar', 'email'])
) {}

/**分页列表查询**/
export class ColumnAccountOptions extends IntersectionType(
    PickType(OmixColumnOptions, ['page', 'size']),
    PickType(PartialType(schema.WindowsAccount), ['number', 'phone', 'email', 'name', 'status'])
) {}

/**分页列表响应**/
export class ColumnAccountOptionsResponse extends OmixColumnResponse {
    @ApiProperty({ description: '列表数据', type: [schema.WindowsAccount] })
    list: schema.WindowsAccount[]
}

/**编辑账号状态**/
export class UpdateSwitchAccountOptions extends PickType(schema.WindowsAccount, ['uid', 'status']) {}
