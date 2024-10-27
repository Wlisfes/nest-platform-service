import { ApiProperty, PickType, PartialType, IntersectionType } from '@nestjs/swagger'
import { IsNotEmpty, IsEnum, IsArray, ArrayNotEmpty } from 'class-validator'
import { tbSimple, tbSimpleColumn } from '@/entities/instance'
import * as enums from '@/enums/instance'

/**字典实体**/
export class RestSimple extends tbSimple {}

/**字典配置列表**/
export class BodySimpleColumn extends IntersectionType(
    PickType(tbSimpleColumn, ['name', 'value', 'sort']),
    PartialType(PickType(tbSimpleColumn, ['id', 'pid', 'state']))
) {}

/**创建字典**/
export class BodyUpdateSimple extends PickType(tbSimple, ['id', 'name', 'comment']) {
    @ApiProperty({ description: '字典配置列表', type: [BodySimpleColumn] })
    @ArrayNotEmpty({ message: '字典配置列表不可为空' })
    @IsArray({ message: '字典配置列表必须为Array' })
    @IsNotEmpty({ message: '字典配置列表必填' })
    list: Array<BodySimpleColumn>
}

/**批量字典树**/
export class BodyColumnSimple {
    @ApiProperty({ description: '字典类型列表' })
    @IsEnum(enums.SimpleStalk, { each: true, message: '字典类型不存在' })
    @ArrayNotEmpty({ message: '字典类型列表不可为空' })
    @IsArray({ message: '字典类型列表必须为Array' })
    @IsNotEmpty({ message: '字典类型列表必填' })
    batch: Array<enums.SimpleStalk>
}

/**字典树**/
export class BodyStalkSimple extends PickType(tbSimpleColumn, []) {}
