import { PickType, IntersectionType, PartialType } from '@nestjs/swagger'
import { OmixColumn } from '@/interface/instance.resolver'
import { SchemaChunk } from '@/modules/database/database.schema'

/**根据keyId验证数据是否不存在**/
export class BaseCheckKeyIdSystemChunk extends PickType(SchemaChunk, ['keyId']) {
    /**验证错误描述**/
    message: string
    /**输出日志方法名**/
    deplayName: string
}

/**新增字典**/
export class BaseSystemChunkCreate extends IntersectionType(PickType(SchemaChunk, ['type', 'name', 'value', 'pid', 'comment', 'json'])) {}

/**字典列表**/
export class BaseSystemColumnChunk extends IntersectionType(
    PickType(OmixColumn, ['page', 'size', 'vague', 'startTime', 'endTime']),
    PickType(PartialType(SchemaChunk), ['type', 'name', 'value', 'status', 'uid'])
) {}

/**编辑字典**/
export class BaseSystemUpdateChunk extends IntersectionType(PickType(SchemaChunk, ['keyId']), BaseSystemChunkCreate) {}

/**编辑字典状态**/
export class BaseSystemSwitchChunk extends PickType(SchemaChunk, ['keyId', 'status']) {}
