import { ApiProperty, PickType, IntersectionType, PartialType } from '@nestjs/swagger'
import { OmixColumnOptions, OmixPayloadOptions, OmixColumnResponse } from '@/interface'
import { IsOptional, IsArray } from 'class-validator'
import * as schema from '@/modules/database/schema'

/**账号详情**/
export class AccountPayloadOptions extends PickType(schema.WindowsAccount, ['uid']) {}

/**账号详情响应**/
export class AccountPayloadOptionsResponse extends schema.WindowsAccount {}

/**新增用户账号**/
export class CreateAccountOptions extends IntersectionType(
    PickType(schema.WindowsAccount, ['name', 'number', 'phone', 'password', 'status']),
    PickType(schema.WindowsAccount, ['avatar', 'email'])
) {}

/**分页列表查询**/
export class ColumnAccountOptions extends IntersectionType(
    PickType(OmixColumnOptions, ['page', 'size']),
    PickType(PartialType(schema.WindowsAccount), ['number', 'phone', 'email', 'name', 'status'])
) {
    @ApiProperty({ description: '归属部门', required: false, example: [] })
    @IsArray({ message: '归属部门 必须为Array<number>格式' })
    @IsOptional()
    depts: Array<number>
}

/**分页列表响应**/
export class ColumnAccountOptionsResponse extends OmixColumnResponse {
    @ApiProperty({ description: '列表数据', type: [schema.WindowsAccount] })
    list: schema.WindowsAccount[]
}

/**编辑账号**/
export class UpdateAccountOptions extends IntersectionType(
    PickType(schema.WindowsAccount, ['uid', 'name', 'number', 'phone', 'status']),
    PartialType(PickType(schema.WindowsAccount, ['email']))
) {
    @ApiProperty({ description: '归属部门', example: [] })
    @IsArray({ message: '归属部门 必须为Array<number>格式' })
    depts: Array<number>
}

/**编辑账号状态**/
export class UpdateSwitchAccountOptions extends PickType(schema.WindowsAccount, ['uid', 'status']) {}

/**删除账号**/
export class DeleteAccountOptions extends PickType(schema.WindowsAccount, ['uid']) {}

/**账号下拉列表项**/
export class SelectAccountItem {
    @ApiProperty({ description: '账号UID', example: '2149446185344106496' })
    value: string

    @ApiProperty({ description: '账号名称', example: '张三 1001' })
    name: string
}

/**账号下拉列表响应**/
export class SelectAccountOptionsResponse {
    @ApiProperty({ description: '列表数据', type: [SelectAccountItem] })
    list: SelectAccountItem[]
}
