import { ApiProperty, PickType, PartialType, IntersectionType } from '@nestjs/swagger'
import { IsOptional } from '@/decorator/common.decorator'
import { OmixPayload, OmixColumnPayload } from '@/interface/instance.resolver'
import { tbMember, tbDept, tbDeptMember } from '@/entities/instance'

/**创建员工账号**/
export class BodyCreateMember extends IntersectionType(
    PickType(tbMember, ['name', 'jobNumber']),
    PickType(tbDeptMember, ['deptId', 'master'])
) {}

/**员工账号列表**/
export class BodyColumnMember extends IntersectionType(OmixColumnPayload) {}
