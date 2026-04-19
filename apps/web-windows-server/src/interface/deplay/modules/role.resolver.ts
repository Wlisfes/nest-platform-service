import { ApiProperty, PickType, IntersectionType, PartialType } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsArray } from 'class-validator'
import { Type } from 'class-transformer'
import { OmixColumnOptions, OmixPayloadOptions, OmixColumnResponse } from '@/interface'
import * as schema from '@/modules/database/schema'

/**角色详情**/
export class RolePayloadOptions extends PickType(schema.WindowsRole, ['keyId']) {}

/**角色详情响应**/
export class RolePayloadOptionsResponse extends schema.WindowsRole {}

/**新增岗位角色**/
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
    PickType(OmixColumnOptions, ['page', 'size', 'vague']),
    PartialType(PickType(schema.WindowsRoleAccount, ['roleId'])),
    PartialType(PickType(schema.WindowsAccount, ['phone', 'email']))
) {}

/**角色关联账号分页列表响应**/
export class ColumnAccountRoleOptionsResponse extends OmixColumnResponse {
    @ApiProperty({ description: '列表数据', type: [schema.WindowsAccount] })
    list: schema.WindowsAccount[]
}

/**角色关联用户**/
export class CreateAccountRoleOptions extends IntersectionType(
    PickType(schema.WindowsRole, ['keyId']),
    PickType(OmixPayloadOptions, ['uids'])
) {}

/**删除角色关联用户**/
export class DeleteAccountRoleOptions extends IntersectionType(
    PickType(schema.WindowsRole, ['keyId']),
    PickType(OmixPayloadOptions, ['uids'])
) {}

/**角色菜单权限列表查询**/
export class ColumnRoleSheetOptions extends PickType(schema.WindowsRoleSheet, ['roleId']) {}

/**角色菜单权限列表响应**/
export class ColumnRoleSheetOptionsResponse {
    @ApiProperty({ description: '列表数据', type: [Number] })
    list: number[]
}

/**更新角色菜单权限**/
export class UpdateRoleSheetOptions {
    @ApiProperty({ description: '角色ID', example: 1000 })
    @IsNotEmpty({ message: '角色ID必填' })
    @IsNumber({}, { message: '角色ID必须为number' })
    @Type(() => Number)
    roleId: number

    @ApiProperty({ description: '菜单ID列表', example: [] })
    @IsArray({ message: 'sheetIds必须为Array<number>格式' })
    @IsNumber({}, { each: true, message: 'sheetIds每项必须为number' })
    sheetIds: number[]
}

/**更新角色数据权限**/
export class UpdateRoleModelOptions extends IntersectionType(PickType(schema.WindowsRole, ['keyId', 'model'])) {}

/**删除岗位角色**/
export class DeleteRoleOptions extends PickType(schema.WindowsRole, ['keyId']) {}

/**批量更新角色排序**/
export class UpdateRoleSortOptions {
    @ApiProperty({ description: '排序列表', example: [{ keyId: 1, sort: 0 }] })
    @IsArray({ message: 'list必须为Array格式' })
    list: Array<{ keyId: number; sort: number }>
}
