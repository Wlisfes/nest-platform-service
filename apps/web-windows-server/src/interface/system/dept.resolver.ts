import { PickType, IntersectionType, PartialType } from '@nestjs/swagger'
import { OmixColumn, OmixPayload } from '@/interface'
import { WindowsDept } from '@/modules/database/schema'

/**新增部门**/
export class CreateDeptOptions extends IntersectionType(
    PickType(WindowsDept, ['name']),
    PartialType(PickType(WindowsDept, ['alias', 'pid']))
) {}

/**编辑部门**/
export class UpdateDeptOptions extends IntersectionType(CreateDeptOptions, PickType(WindowsDept, ['keyId'])) {}

/**部门详情**/
export class DeptResolverOptions extends PickType(WindowsDept, ['keyId']) {}

/**部门列表**/
export class ColumnDeptOptions extends IntersectionType(
    PickType(OmixColumn, ['page', 'size', 'vague', 'startTime', 'endTime']),
    PartialType(PickType(WindowsDept, ['name', 'alias', 'pid']))
) {}

/**删除部门**/
export class DeleteDeptOptions extends PickType(OmixPayload, ['keys']) {}
