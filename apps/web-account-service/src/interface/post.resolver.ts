import { ApiProperty, PickType, PartialType, IntersectionType } from '@nestjs/swagger'
import { tbPost } from '@/entities/instance'

/**职位实体**/
export class RestPost extends tbPost {}

/**创建部门**/
export class BodyCreatePost extends PickType(tbPost, ['title']) {}

/**编辑部门**/
export class BodyUpdatePost extends PickType(tbPost, ['postId', 'title']) {}
