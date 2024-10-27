import { ApiProperty, PickType, PartialType, IntersectionType } from '@nestjs/swagger'
import { IsNotEmpty, IsEnum, IsArray, ArrayNotEmpty } from 'class-validator'
import { OmixColumnPayload } from '@/interface/instance.resolver'
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

/**字典列表**/
export class BodyColumnSimple extends IntersectionType(OmixColumnPayload) {}

/**字典详情**/
export class BodyResolveSimple extends PickType(tbSimple, ['id']) {}
