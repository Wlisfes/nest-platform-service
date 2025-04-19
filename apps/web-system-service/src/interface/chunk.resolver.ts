import { ApiProperty, PickType, IntersectionType, PartialType } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsString, IsArray } from 'class-validator'
import { IsOptional } from '@/decorator/common.decorator'
import { OmixColumn } from '@/interface/instance.resolver'
import { SchemaChunk } from '@/modules/database/database.schema'
import * as enums from '@/modules/database/database.enums'

export class BaseSystemChunkRequest {
    /**验证错误描述**/
    message: string
    /**输出日志方法名**/
    deplayName: string
}

/**刷新redis字典缓存**/
export class BaseUpdateRedisSystemChunk {
    /**字典类型**/
    type: string | keyof typeof enums.STATIC_SCHEMA_CHUNK_OPTIONS
    /**字典类型值**/
    value: string
}

/**根据keyId验证数据是否不存在**/
export class BaseCheckKeyIdSystemChunk extends PickType(SchemaChunk, ['keyId']) {
    /**验证错误描述**/
    message: string
    /**输出日志方法名**/
    deplayName: string
}

/**验证字典类型、value是否重复**/
export class BaseCheckRepeatSystemChunk {
    keyId?: string
    /**字典类型**/
    type: string
    /**字典类型值**/
    value: string
    /**验证错误描述**/
    message: string
    /**输出日志方法名**/
    deplayName: string
}

/**验证字典值缓存是否合规**/
export class BaseCheckSystemChunk extends BaseUpdateRedisSystemChunk {
    /**验证错误描述**/
    message?: string
    /**输出日志方法名**/
    deplayName?: string
}

/**新增字典**/
export class BaseCreateSystemChunk extends IntersectionType(PickType(SchemaChunk, ['type', 'name', 'value', 'pid', 'comment', 'json'])) {}

/**字典列表**/
export class BaseColumnSystemChunk extends IntersectionType(
    PickType(OmixColumn, ['page', 'size', 'vague', 'startTime', 'endTime']),
    PickType(PartialType(SchemaChunk), ['type', 'name', 'value', 'status', 'uid'])
) {}

/**编辑字典**/
export class BaseUpdateSystemChunk extends IntersectionType(PickType(SchemaChunk, ['keyId']), BaseCreateSystemChunk) {}

/**编辑字典状态**/
export class BaseUpdateStateSystemChunk extends PickType(SchemaChunk, ['keyId', 'status']) {}

/**批量获取字典分类列表**/
export class BaseSelectSystemChunk {
    @ApiProperty({ description: '字典类型列表' })
    @Type(() => String)
    @IsOptional()
    @IsArray({ message: 'type 必须为Array<string>格式' })
    @IsString({ each: true, message: 'type 必须为Array<string>格式' })
    type: string[] = []
}
