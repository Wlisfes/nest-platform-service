import { PickType, IntersectionType, PartialType } from '@nestjs/swagger'
import { OmixColumn, OmixPayload, OmixBaseOptions } from '@/interface/instance.resolver'
import { SchemaDept } from '@/modules/database/database.schema'

/**新增部门**/
export class BaseSystemDeptCreate extends PickType(SchemaDept, ['name', 'bit', 'pid']) {}
