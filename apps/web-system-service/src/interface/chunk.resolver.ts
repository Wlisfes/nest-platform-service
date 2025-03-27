import { PickType, IntersectionType, PartialType } from '@nestjs/swagger'
import { OmixColumn } from '@/interface/instance.resolver'
import { SchemaChunk } from '@/modules/database/database.schema'

/**新增字典**/
export class BaseCreateSystemChunk extends PickType(SchemaChunk, ['type', 'name', 'value', 'pid', 'comment', 'json']) {}
