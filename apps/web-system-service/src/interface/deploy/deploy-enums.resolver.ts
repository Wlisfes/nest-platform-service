import { Omix } from '@/interface/instance.resolver'
import * as schema from '@/modules/database/database.schema'
import * as enums from '@/modules/database/database.enums'

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

/**查询枚举类型列表**/
export interface BaseDeployChaxunEnums extends Partial<Record<EnumsTypes, boolean>> {
    /**输出日志方法名**/
    deplayName?: string
    /**表字段列表**/
    field?: Array<keyof typeof schema.SchemaChunk>
}
