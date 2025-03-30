import { PickType, IntersectionType, PartialType } from '@nestjs/swagger'
import { OmixColumn } from '@/interface/instance.resolver'
import { SchemaChunk } from '@/modules/database/database.schema'
import * as enums from '@/modules/database/database.enums'

/**刷新redis字典缓存**/
export class BaseUpdateRedisSystemChunk {
    /**字典类型**/
    type: keyof typeof enums.SCHEMA_CHUNK_OPTIONS
    /**字典类型值**/
    value: string
}

/**验证字典值缓存是否合规**/
export class BaseCheckSystemChunk extends BaseUpdateRedisSystemChunk {
    /**验证错误描述**/
    message?: string
    /**输出日志方法名**/
    fnName?: string
}

/**查询字典类型列表**/
export interface BaseChaxunSystemChunk<T, K extends keyof T> extends Partial<Record<keyof typeof enums.SCHEMA_CHUNK_OPTIONS, boolean>> {
    /**输出日志方法名**/
    fnName?: string
    /**表字段列表**/
    field?: Array<K>
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
export class BaseUpdateStateSystemChunk extends PickType(SchemaChunk, ['keyId', 'status']) {}
