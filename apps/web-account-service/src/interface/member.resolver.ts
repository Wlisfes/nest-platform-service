import { ApiProperty, ApiPropertyOptional, PickType, IntersectionType } from '@nestjs/swagger'
import { IsNotEmpty, IsArray, ArrayNotEmpty } from 'class-validator'
import { IsOptional } from '@/decorator/common.decorator'
import { OmixColumnPayload } from '@/interface/instance.resolver'
import { tbMember } from '@/entities/instance'

/**创建员工账号**/
export class BodyCreateMember extends PickType(tbMember, ['name', 'jobNumber']) {
    @ApiProperty({ description: '部门列表' })
    @ArrayNotEmpty({ message: '部门列表不可为空' })
    @IsArray({ message: '部门列表必须为Array' })
    @IsNotEmpty({ message: '部门列表必填' })
    dept: Array<string>

    @ApiProperty({ description: '职位列表' })
    @ArrayNotEmpty({ message: '职位列表不可为空' })
    @IsArray({ message: '职位列表必须为Array' })
    @IsNotEmpty({ message: '职位列表必填' })
    post: Array<string>

    @ApiProperty({ description: '职级列表' })
    @ArrayNotEmpty({ message: '职级列表不可为空' })
    @IsArray({ message: '职级列表必须为Array' })
    @IsNotEmpty({ message: '职级列表必填' })
    rank: Array<string>

    @ApiPropertyOptional({ description: '部门子管理员列表' })
    @IsOptional()
    @IsArray({ message: '部门子管理员列表必须为Array' })
    master: Array<string>
}

/**员工账号列表**/
export class BodyColumnMember extends IntersectionType(OmixColumnPayload) {}
