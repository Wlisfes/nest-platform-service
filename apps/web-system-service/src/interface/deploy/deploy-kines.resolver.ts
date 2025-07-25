import { PickType } from '@nestjs/swagger'
import { SchemaKines } from '@/modules/database/database.schema'

/**更新自定义json**/
export class BaseDeployKinesUpdate extends PickType(SchemaKines, ['type', 'document', 'json']) {}

/**查询自定义json**/
export class BaseDeployKinesCompiler extends PickType(SchemaKines, ['type']) {}
