import { PickType, IntersectionType, PartialType } from '@nestjs/swagger'
import { OmixColumn, OmixPayload, OmixBaseOptions } from '@/interface/instance.resolver'
import { SchemaDept } from '@/modules/database/database.schema'

/**新增部门**/
export class BaseSystemDeptCreate extends PickType(SchemaDept, ['name', 'bit', 'pid']) {}

/**编辑部门**/
export class BaseSystemDeptUpdate extends PickType(SchemaDept, ['keyId', 'name', 'bit', 'pid']) {}

/**部门详情信息**/
export class BaseSystemDeptResolver extends PickType(SchemaDept, ['keyId']) {}
