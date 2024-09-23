import { ApiProperty, PickType, PartialType, IntersectionType } from '@nestjs/swagger'
import { IsOptional } from '@/decorator/common.decorator'
import { tbSimple } from '@/entities/instance'
import * as enums from '@/enums/instance'

/**字典实体**/
export class RestSimple extends tbSimple {
    @ApiProperty({ description: '字典类型' })
    batch: Array<enums.SimpleStalk>
}

/**创建字典**/
export class BodyCreateSimple extends IntersectionType(
    PickType(tbSimple, ['name', 'stalk']),
    PartialType(PickType(tbSimple, ['pid', 'props', 'state']))
) {}

/**字典树**/
export class BodyStalkSimple extends PickType(tbSimple, ['stalk']) {}

/**批量字典树**/
export class BodyBatchSimple extends PickType(RestSimple, ['batch']) {}
