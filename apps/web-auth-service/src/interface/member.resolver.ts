import { ApiProperty, PickType, PartialType, IntersectionType } from '@nestjs/swagger'
import { IsOptional } from '@/decorator/common.decorator'
import { tbMember } from '@/entities/instance'

/**注册员工账号**/
export class BodyCreateMember extends PickType(tbMember, ['name']) {}
