import { Entity, Column } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, Length, IsEnum } from 'class-validator'
import { CommonEntier } from '@/utils/utils-typeorm'
import * as enums from '@/enums/instance'

@Entity({ name: 'tb_role', comment: '角色表' })
export class tbRole extends CommonEntier {
    @ApiProperty({ description: '角色ID', example: '858619496' })
    @IsNotEmpty({ message: '角色ID必填' })
    @Column({ comment: '角色ID', length: 32, nullable: false })
    id: string

    @ApiProperty({ description: '角色名称', example: '管理员' })
    @IsNotEmpty({ message: '角色名称必填' })
    @Length(2, 32, { message: '角色名称必须保持2~32位' })
    @Column({ comment: '角色名称', length: 32, nullable: false })
    name: string

    @ApiProperty({
        description: '角色类型: 管理员-admin、部门角色-depart、基础角色-basic、通用角色-general',
        enum: enums.RoleType
    })
    @IsNotEmpty({ message: '角色类型必填' })
    @IsEnum(enums.RoleType, { message: '角色类型参数格式错误' })
    @Column({
        comment: '员工状态: 管理员-admin、部门角色-depart、基础角色-basic、通用角色-general',
        default: enums.RoleType.general,
        nullable: false
    })
    type: string

    @ApiProperty({ description: '角色状态: 启用-enable、禁用-disable', enum: enums.RoleState })
    @IsNotEmpty({ message: '角色状态必填' })
    @IsEnum(enums.RoleState, { message: '角色状态参数格式错误' })
    @Column({ comment: '角色状态: 启用-enable、禁用-disable', default: enums.RoleState.enable, nullable: false })
    state: string
}
