import { ApiProperty, PickType, PartialType, IntersectionType } from '@nestjs/swagger'
import { tbSimple } from '@/entities/instance'
import * as enums from '@/enums/instance'

/**字典实体**/
export class RestSimple extends tbSimple {}

/**创建字典**/
export class BodyCreateSimple extends IntersectionType(
    PickType(tbSimple, ['name', 'stalk']),
    PartialType(PickType(tbSimple, ['pid', 'props', 'state']))
) {}

/**批量字典树**/
export class BodyColumnSimple {
    @ApiProperty({ description: '字典类型' })
    batch: Array<enums.SimpleStalk>
}

/**字典树**/
export class BodyStalkSimple extends PickType(tbSimple, ['stalk']) {}
