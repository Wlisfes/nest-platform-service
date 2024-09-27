import { ApiProperty, PickType, PartialType, IntersectionType } from '@nestjs/swagger'
import { IsOptional } from '@/decorator/common.decorator'
import { tbDept } from '@/entities/instance'

/**部门实体**/
export class RestDept extends tbDept {}

/**创建部门**/
export class BodyCreateDept extends IntersectionType(PickType(tbDept, ['deptName']), PartialType(PickType(tbDept, ['parentId']))) {}

/**编辑部门**/
export class BodyUpdateDept extends PickType(tbDept, ['deptId', 'deptName']) {}
