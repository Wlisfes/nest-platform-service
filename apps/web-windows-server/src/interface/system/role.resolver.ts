import { ApiProperty, PickType, IntersectionType, PartialType } from '@nestjs/swagger'
import { OmixColumnOptions, OmixColumnResponse } from '@/interface'
import * as schema from '@/modules/database/schema'

/**角色详情**/
export class RolePayloadOptions extends PickType(schema.WindowsRole, ['keyId']) {}

/**角色详情响应**/
export class RolePayloadOptionsResponse extends schema.WindowsRole {}

/**添加通用角色**/
export class CreateCommonRoleOptions extends IntersectionType(
    PickType(schema.WindowsRole, ['name', 'model']),
    PartialType(PickType(schema.WindowsRole, ['comment', 'sort']))
) {}

/**编辑通用角色**/
export class UpdateCommonRoleOptions extends IntersectionType(
    PickType(schema.WindowsRole, ['keyId', 'name', 'model']),
    PartialType(PickType(schema.WindowsRole, ['comment', 'sort']))
) {}

/**添加部门角色**/
export class CreateDepartmentRoleOptions extends IntersectionType(
    PickType(schema.WindowsRole, ['name', 'model', 'deptId']),
    PartialType(PickType(schema.WindowsRole, ['comment', 'sort']))
) {}

/**编辑部门角色**/
export class UpdateDepartmentRoleOptions extends IntersectionType(
    PickType(schema.WindowsRole, ['keyId', 'name', 'model', 'deptId']),
    PartialType(PickType(schema.WindowsRole, ['comment', 'sort']))
) {}

/**通用角色列表查询**/
export class ColumnCommonRoleOptions extends IntersectionType(
    PickType(OmixColumnOptions, ['page', 'size']),
    PartialType(PickType(schema.WindowsRole, ['name']))
) {}

/**部门角色列表查询**/
export class ColumnDepartmentRoleOptions extends IntersectionType(
    PickType(OmixColumnOptions, ['page', 'size']),
    PartialType(PickType(schema.WindowsRole, ['name', 'deptId']))
) {}

/**角色列表响应**/
export class ColumnRoleOptionsResponse extends OmixColumnResponse {
    @ApiProperty({ description: '列表数据', type: [schema.WindowsRole] })
    list: schema.WindowsRole[]
}

/**角色关联账号列表查询**/
export class ColumnRoleAccountOptions extends PickType(schema.WindowsRoleAccount, ['roleId']) {}

/**角色关联账号列表响应**/
export class ColumnRoleAccountOptionsResponse {
    @ApiProperty({ description: '列表数据', type: [schema.WindowsRoleAccount] })
    list: schema.WindowsRoleAccount[]
}

/**角色菜单权限列表查询**/
export class ColumnRoleSheetOptions extends PickType(schema.WindowsRoleSheet, ['roleId']) {}

/**角色菜单权限列表响应**/
export class ColumnRoleSheetOptionsResponse {
    @ApiProperty({ description: '列表数据', type: [schema.WindowsRoleSheet] })
    list: schema.WindowsRoleSheet[]
}
