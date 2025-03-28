import { PickType, IntersectionType, PartialType } from '@nestjs/swagger'
import { OmixColumn } from '@/interface/instance.resolver'
import { SchemaChunk } from '@/modules/database/database.schema'
import * as enums from '@/modules/database/database.enums'

/**刷新redis字典缓存**/
export class BaseUpdateRedisSystemChunk {
    type: keyof typeof enums.SCHEMA_CHUNK_OPTIONS
    value: string
}

/**新增字典**/
export class BaseCreateSystemChunk extends PickType(SchemaChunk, ['type', 'name', 'value', 'pid', 'comment', 'json']) {}

/**字典列表**/
export class BaseColumnSystemChunk extends IntersectionType(
    PickType(OmixColumn, ['page', 'size', 'vague', 'startTime', 'endTime']),
    PickType(PartialType(SchemaChunk), ['type', 'name', 'value', 'status', 'uid'])
) {}

/**编辑字典**/
export class BaseUpdateSystemChunk extends IntersectionType(PickType(SchemaChunk, ['keyId']), BaseCreateSystemChunk) {}

/**编辑字典状态**/
export class BaseSwitchSystemChunk extends PickType(SchemaChunk, ['keyId', 'status']) {}
