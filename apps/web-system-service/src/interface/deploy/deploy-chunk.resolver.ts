import { ApiProperty, PickType, IntersectionType, PartialType } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsString, IsArray } from 'class-validator'
import { IsOptional } from '@/decorator/common.decorator'
import { Omix, OmixColumn } from '@/interface/instance.resolver'
import * as schema from '@/modules/database/database.schema'
import * as enums from '@/modules/database/database.enums'

/**字典类型聚合**/
export type ChunkTypes = keyof typeof enums.STATIC_SCHEMA_CHUNK_OPTIONS | keyof typeof enums.DYNAMIC_SCHEMA_CHUNK_OPTIONS

/**字典类型对接**/
export interface BaseSchemaChunk extends Omix<Record<ChunkTypes, schema.SchemaChunk>> {}

/**查询字典类型列表**/
export interface BaseDeployChunkStatic extends Partial<Record<ChunkTypes, boolean>> {
    /**输出日志方法名**/
    deplayName?: string
    /**表字段列表**/
    field?: Array<keyof typeof schema.SchemaChunk>
}

/**查询字典类型列表**/
export interface BaseDeployChaxunChunk extends Partial<Record<ChunkTypes, boolean>> {
    /**输出日志方法名**/
    deplayName?: string
    /**表字段列表**/
    field?: Array<keyof typeof schema.SchemaChunk>
}
