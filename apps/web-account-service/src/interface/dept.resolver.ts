import { ApiProperty, PickType, PartialType, IntersectionType } from '@nestjs/swagger'
import { IsOptional } from '@/decorator/common.decorator'
import { tbDept } from '@/entities/instance'

/**创建部门**/
export class BodyCreateDept extends PickType(tbDept, ['deptName']) {}

/**编辑部门**/
export class BodyUpdateDept extends PickType(tbDept, ['deptId', 'deptName']) {}
