import { ApiProperty, PickType, PartialType, IntersectionType } from '@nestjs/swagger'
import { IsOptional } from '@/decorator/common.decorator'
import { tbSimple } from '@/entities/instance'

/**字典实体**/
export class RestSimple extends tbSimple {}

/**创建字典**/
export class BodyCreateSimple extends IntersectionType(
    PickType(tbSimple, ['name', 'stalk']),
    PartialType(PickType(tbSimple, ['pid', 'props', 'state']))
) {}
