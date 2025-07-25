import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNotEmpty } from 'class-validator'
import { Omix } from '@/interface/instance.resolver'
import * as schema from '@/modules/database/database.schema'
import * as enums from '@/modules/database/database.enums'

/**枚举类型值描述聚合**/
const EnumsDocuments = [...Object.values(enums.STATIC_SCHEMA_CHUNK_OPTIONS), ...Object.values(enums.DYNAMIC_SCHEMA_CHUNK_OPTIONS)].map(
    (item: Omix) => `</br> ${item.name}：${item.value}`
)

/**枚举类型聚合**/
export type EnumsTypes = keyof typeof enums.STATIC_SCHEMA_CHUNK_OPTIONS | keyof typeof enums.DYNAMIC_SCHEMA_CHUNK_OPTIONS

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

/**刷新redis字典缓存**/
export interface BaseUpdateRedisSystemEnums extends Omix {
    /**输出日志方法名**/
    deplayName?: string
    /**字典类型**/
    type: string
    /**字典类型值**/
    value: string
}

/**验证枚举值缓存是否合规**/
export interface BaseDeployRedisEnumsCheck extends BaseUpdateRedisSystemEnums {
    /**验证错误描述**/
    message?: string
    /**输出日志方法名**/
    deplayName?: string
}

/**批量获取枚举分类列表**/
export class BaseDeployEnumsCompiler {
    /**输出日志方法名**/
    deplayName?: string

    @ApiProperty({ description: '字典类型列表', enum: EnumsDocuments })
    @IsNotEmpty({ message: 'type类型必填' })
    @IsString({ each: true, message: 'type 必须为Array<string>格式' })
    type: string[] = []
}
