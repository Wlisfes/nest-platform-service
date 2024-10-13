import { ApiProperty, PickType, PartialType, IntersectionType } from '@nestjs/swagger'
import { IsOptional } from '@/decorator/common.decorator'
import { tbRouter } from '@/entities/instance'

/**菜单实体**/
export class RestRouter extends tbRouter {}

/**创建菜单**/
export class BodyCreateRouter extends IntersectionType(
    PickType(tbRouter, ['type', 'name', 'show', 'version', 'sort', 'instance', 'state']),
    PickType(tbRouter, ['pid', 'path', 'icon', 'active'])
) {}
