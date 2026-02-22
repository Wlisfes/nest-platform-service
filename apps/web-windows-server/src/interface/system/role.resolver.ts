import { ApiProperty, PickType, IntersectionType, PartialType } from '@nestjs/swagger'
import { OmixColumnOptions, OmixColumnResponse } from '@/interface'
import * as schema from '@/modules/database/schema'

/**角色详情**/
export class RolePayloadOptions extends PickType(schema.WindowsRole, ['keyId']) {}

/**角色详情响应**/
export class RolePayloadOptionsResponse extends schema.WindowsRole {}

/**添加岗位角色**/
export class CreateRoleOptions extends IntersectionType(
    PickType(schema.WindowsRole, ['name', 'model']),
    PartialType(PickType(schema.WindowsRole, ['comment', 'sort']))
) {}

/**编辑岗位角色**/
export class UpdateRoleOptions extends IntersectionType(
    PickType(schema.WindowsRole, ['keyId', 'name', 'model']),
    PartialType(PickType(schema.WindowsRole, ['comment', 'sort']))
) {}

/**角色列表响应**/
export class ColumnRoleOptionsResponse {
    @ApiProperty({ description: '岗位角色列表', type: [schema.WindowsRole] })
    list: schema.WindowsRole[]

    @ApiProperty({ description: '部门角色树结构', type: [schema.WindowsDept] })
    dept: schema.WindowsDept[]
}

/**角色关联账号分页列表查询**/
export class ColumnAccountRoleOptions extends IntersectionType(
    PickType(OmixColumnOptions, ['page', 'size']),
    PartialType(PickType(schema.WindowsRoleAccount, ['roleId']))
) {}

/**角色关联账号分页列表响应**/
export class ColumnAccountRoleOptionsResponse extends OmixColumnResponse {
    @ApiProperty({ description: '列表数据', type: [schema.WindowsRoleAccount] })
    list: schema.WindowsRoleAccount[]
}

/**角色关联用户**/
export class CreateAccountRoleOptions {
    @ApiProperty({ description: '角色ID', example: 1000 })
    roleId: number

    @ApiProperty({ description: '账号UID列表', example: [] })
    uids: string[]
}

/**删除角色关联用户**/
export class DeleteAccountRoleOptions {
    @ApiProperty({ description: '角色ID', example: 1000 })
    roleId: number

    @ApiProperty({ description: '关联记录ID列表', example: [] })
    keys: number[]
}

/**角色菜单权限列表查询**/
export class ColumnRoleSheetOptions extends PickType(schema.WindowsRoleSheet, ['roleId']) {}

/**角色菜单权限列表响应**/
export class ColumnRoleSheetOptionsResponse {
    @ApiProperty({ description: '列表数据', type: [schema.WindowsRoleSheet] })
    list: schema.WindowsRoleSheet[]
}
