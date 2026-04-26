import { ApiProperty, ApiPropertyOptional, PickType, IntersectionType, PartialType } from '@nestjs/swagger'
import { IsOptional, IsString, IsArray } from 'class-validator'
import { OmixColumnOptions, OmixColumnResponse } from '@/interface'
import * as schema from '@/modules/database/schema'

/**批量查询账号关联部门**/
export interface UtilsUidByColumnDepartmentOptions extends Omix {
    uids: Array<string>
}

/**部门详情**/
export class DeptPayloadOptions extends PickType(schema.WindowsDept, ['keyId']) {}

/**部门详情响应**/
export class DeptPayloadOptionsResponse extends schema.WindowsDept {}

/**新增部门**/
export class CreateDeptOptions extends IntersectionType(
    PickType(schema.WindowsDept, ['name']),
    PartialType(PickType(schema.WindowsDept, ['alias', 'pid']))
) {}

/**编辑部门**/
export class UpdateDeptOptions extends IntersectionType(
    PickType(schema.WindowsDept, ['keyId', 'name']),
    PartialType(PickType(schema.WindowsDept, ['alias', 'pid']))
) {
    @ApiPropertyOptional({ description: '管理员UID' })
    @IsOptional()
    @IsString()
    adminUid?: string

    @ApiPropertyOptional({ description: '子管理员UID列表', type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    subAdminUids?: string[]
}

/**分页列表查询**/
export class ColumnDeptOptions extends IntersectionType(
    PickType(OmixColumnOptions, ['page', 'size']),
    PartialType(PickType(schema.WindowsDept, ['name', 'alias', 'pid']))
) {}

/**分页列表响应**/
export class ColumnDeptOptionsResponse extends OmixColumnResponse {
    @ApiProperty({ description: '列表数据', type: [schema.WindowsDept] })
    list: schema.WindowsDept[]
}

/**删除部门**/
export class DeleteDeptOptions extends PickType(schema.WindowsDept, ['keyId']) {}

