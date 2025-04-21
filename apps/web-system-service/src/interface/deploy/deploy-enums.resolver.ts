import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsString, IsArray, IsNotEmpty } from 'class-validator'
import { IsOptional } from '@/decorator/common.decorator'
import { Omix } from '@/interface/instance.resolver'
import * as schema from '@/modules/database/database.schema'
import * as enums from '@/modules/database/database.enums'

/**批量获取枚举分类列表**/
export class BaseDeployEnumsCompiler {
    @ApiProperty({ description: '字典类型列表' })
    @IsNotEmpty({ message: 'type类型必填' })
    @IsString({ each: true, message: 'type 必须为Array<string>格式' })
    type: string[] = []
}

/**枚举类型聚合**/
export type EnumsTypes = keyof typeof enums.STATIC_SCHEMA_CHUNK_OPTIONS

/**枚举类型对象**/
export interface BaseSchemaEnums extends Omix<Record<EnumsTypes, schema.SchemaChunk>> {}

/**查询枚举类型列表**/
export interface BaseDeployEnumsStatic extends Partial<Record<EnumsTypes, boolean>> {
    /**输出日志方法名**/
    deplayName?: string
    /**表字段列表**/
    field?: Array<keyof typeof schema.SchemaChunk>
}

/**组合查询枚举类型列表**/
export interface BaseDeployEnumsCompose extends Partial<Record<EnumsTypes, boolean>> {
    /**输出日志方法名**/
    deplayName?: string
    /**表字段列表**/
    field?: Array<keyof typeof schema.SchemaChunk>
}
