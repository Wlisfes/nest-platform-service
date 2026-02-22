import { ApiProperty, PickType } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsNotEmpty, ArrayNotEmpty, IsEnum, IsArray, ValidateNested } from 'class-validator'
import { withExtract, withComment } from '@/modules/database/database.adapter'
import * as enums from '@/modules/database/enums'
import * as schema from '@/modules/database/schema'

/**固定枚举类型**/
export const COMMON_CHUNK = {
    /**账号状态**/
    [enums.CHUNK_WINDOWS_ACCOUNT_STATUS.value]: {
        name: enums.CHUNK_WINDOWS_ACCOUNT_STATUS.name,
        value: enums.CHUNK_WINDOWS_ACCOUNT_STATUS.value,
        columns: withExtract(enums.CHUNK_WINDOWS_ACCOUNT_STATUS)
    },
    /**字段自定义显示类型**/
    [enums.CHUNK_WINDOWS_COMMON_CHUNK.value]: {
        name: enums.CHUNK_WINDOWS_COMMON_CHUNK.name,
        value: enums.CHUNK_WINDOWS_COMMON_CHUNK.value,
        columns: withExtract(enums.CHUNK_WINDOWS_COMMON_CHUNK)
    },
    /**菜单显示状态**/
    [enums.CHUNK_WINDOWS_SHEET_CHECK.value]: {
        name: enums.CHUNK_WINDOWS_SHEET_CHECK.name,
        value: enums.CHUNK_WINDOWS_SHEET_CHECK.value,
        columns: withExtract(enums.CHUNK_WINDOWS_SHEET_CHECK)
    },
    /**菜单类型**/
    [enums.CHUNK_WINDOWS_SHEET_CHUNK.value]: {
        name: enums.CHUNK_WINDOWS_SHEET_CHUNK.name,
        value: enums.CHUNK_WINDOWS_SHEET_CHUNK.value,
        columns: withExtract(enums.CHUNK_WINDOWS_SHEET_CHUNK)
    },
    /**菜单状态**/
    [enums.CHUNK_WINDOWS_SHEET_STATUS.value]: {
        name: enums.CHUNK_WINDOWS_SHEET_STATUS.name,
        value: enums.CHUNK_WINDOWS_SHEET_STATUS.value,
        columns: withExtract(enums.CHUNK_WINDOWS_SHEET_STATUS)
    },
    /**角色类型**/
    [enums.CHUNK_WINDOWS_ROLE_CHUNK.value]: {
        name: enums.CHUNK_WINDOWS_ROLE_CHUNK.name,
        value: enums.CHUNK_WINDOWS_ROLE_CHUNK.value,
        columns: withExtract(enums.CHUNK_WINDOWS_ROLE_CHUNK)
    },
    /**角色数据权限**/
    [enums.CHUNK_WINDOWS_ROLE_MODEL.value]: {
        name: enums.CHUNK_WINDOWS_ROLE_MODEL.name,
        value: enums.CHUNK_WINDOWS_ROLE_MODEL.value,
        columns: withExtract(enums.CHUNK_WINDOWS_ROLE_MODEL)
    }
}

/**通用下拉字典**/
export class ChunkSelectOptions {
    @ApiProperty({ description: withComment('枚举类型', COMMON_CHUNK) })
    @IsNotEmpty({ message: '枚举类型必填' })
    @ArrayNotEmpty({ message: '枚举类型不能为空' })
    @IsEnum(Object.keys(COMMON_CHUNK), { each: true, message: '枚举类型格式错误' })
    type: Array<keyof typeof COMMON_CHUNK>
}

/**字段配置项**/
export class ChunkOptions extends PickType(schema.WindowsChunk, ['prop', 'label', 'check']) {}

/**更新字段配置**/
export class UpdateChunkOptions extends PickType(schema.WindowsChunk, ['keyName']) {
    @ApiProperty({ description: '字段配置列表', type: [ChunkOptions] })
    @IsNotEmpty({ message: '字段配置列表必填' })
    @IsArray({ message: '字段配置列表必须为数组' })
    @ValidateNested({ each: true })
    @Type(() => ChunkOptions)
    fields: ChunkOptions[]
}

/**查询字段配置**/
export class ColumnChunkOptions extends PickType(schema.WindowsChunk, ['keyName']) {}

/**字段配置响应**/
export class ColumnChunkOptionsResponse {
    @ApiProperty({ description: '搜索栏字段配置', type: [ChunkOptions] })
    database: ChunkOptions[]

    @ApiProperty({ description: '表头字段配置', type: [ChunkOptions] })
    customize: ChunkOptions[]
}
