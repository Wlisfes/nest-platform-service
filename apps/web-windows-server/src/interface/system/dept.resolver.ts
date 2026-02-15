import { ApiProperty, PickType, IntersectionType, PartialType } from '@nestjs/swagger'
import { OmixColumnOptions, OmixColumnResponse } from '@/interface'
import * as schema from '@/modules/database/schema'

/**部门详情**/
export class DeptPayloadOptions extends PickType(schema.WindowsDept, ['keyId']) {}

/**部门详情响应**/
export class DeptPayloadOptionsResponse extends schema.WindowsDept {}

/**添加部门**/
export class CreateDeptOptions extends IntersectionType(
    PickType(schema.WindowsDept, ['name']),
    PartialType(PickType(schema.WindowsDept, ['alias', 'pid']))
) {}

/**编辑部门**/
export class UpdateDeptOptions extends IntersectionType(
    PickType(schema.WindowsDept, ['keyId', 'name']),
    PartialType(PickType(schema.WindowsDept, ['alias', 'pid']))
) {}

/**分页列表查询**/
export class ColumnDeptOptions extends IntersectionType(
    PickType(OmixColumnOptions, ['page', 'size']),
    PartialType(PickType(schema.WindowsDept, ['name', 'keyId', 'pid', 'createBy']))
) {}

/**分页列表响应**/
export class ColumnDeptOptionsResponse extends OmixColumnResponse {
    @ApiProperty({ description: '列表数据', type: [schema.WindowsDept] })
    list: schema.WindowsDept[]
}
