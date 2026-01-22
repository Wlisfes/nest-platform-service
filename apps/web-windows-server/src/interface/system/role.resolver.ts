import { PickType, IntersectionType, PartialType } from '@nestjs/swagger'
import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsNotEmpty } from 'class-validator'
import { OmixColumn, OmixPayload } from '@/interface'
import { WindowsRole } from '@/modules/database/schema'

/**新增角色**/
export class CreateRoleOptions extends IntersectionType(
    PickType(WindowsRole, ['name']),
    PartialType(PickType(WindowsRole, ['comment', 'sort', 'model']))
) {}

/**编辑角色**/
export class UpdateRoleOptions extends IntersectionType(CreateRoleOptions, PickType(WindowsRole, ['keyId'])) {}

/**角色详情**/
export class RoleResolverOptions extends PickType(WindowsRole, ['keyId']) {}

/**角色列表**/
export class ColumnRoleOptions extends IntersectionType(
    PickType(OmixColumn, ['page', 'size', 'vague', 'startTime', 'endTime']),
    PartialType(PickType(WindowsRole, ['name', 'model']))
) {}

/**删除角色**/
export class DeleteRoleOptions extends PickType(OmixPayload, ['keys']) {}

/**角色授权**/
export class GrantRoleOptions {
    @ApiProperty({ description: '角色ID', example: 1000 })
    @IsNotEmpty({ message: 'roleId 必填' })
    roleId: number

    @ApiProperty({ description: '菜单资源ID列表', example: [] })
    @IsArray({ message: 'resourceIds 必须为 Array<number>' })
    resourceIds: Array<number>

    @ApiProperty({ description: '按钮权限ID列表', example: [] })
    @IsArray({ message: 'sheetIds 必须为 Array<number>' })
    sheetIds: Array<number>

    @ApiProperty({ description: '接口权限ID列表', example: [] })
    @IsArray({ message: 'apifoxIds 必须为 Array<number>' })
    apifoxIds: Array<number>
}

/**查询角色权限**/
export class RolePermissionsOptions {
    @ApiProperty({ description: '角色ID', example: 1000 })
    @IsNotEmpty({ message: 'roleId 必填' })
    roleId: number
}
