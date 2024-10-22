import { Entity, Column } from 'typeorm'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsEnum } from 'class-validator'
import { CommonEntier } from '@/utils/utils-typeorm'
import * as enums from '@/enums/instance'

@Entity({ name: 'tb_dept', comment: '部门表' })
export class tbDept extends CommonEntier {
    @ApiProperty({ description: '部门ID', example: '858619496' })
    @IsNotEmpty({ message: '部门ID必填' })
    @Column({ comment: '部门ID', length: 32, nullable: false })
    deptId: string

    @ApiProperty({ description: '部门名称', example: '产研中心' })
    @IsNotEmpty({ message: '部门名称必填' })
    @Column({ comment: '部门名称', length: 32, nullable: false })
    deptName: string

    @ApiProperty({ description: '上级部门ID', example: '858619496' })
    @IsNotEmpty({ message: '上级部门ID必填' })
    @Column({ comment: '上级部门ID', length: 32, nullable: true })
    parentId: string

    @ApiProperty({ description: '部门状态: 启用-enable、禁用-disable', enum: enums.DeptState })
    @IsNotEmpty({ message: '部门状态必填' })
    @IsEnum(enums.DeptState, { message: '部门状态参数格式错误' })
    @Column({ comment: '部门状态: 启用-enable、禁用-disable', default: enums.DeptState.enable, nullable: false })
    state: string
}

@Entity({ name: 'tb_dept_member', comment: '部门员工表' })
export class tbDeptMember extends CommonEntier {
    @ApiProperty({ description: '部门ID', example: '858619496' })
    @IsNotEmpty({ message: '部门ID必填' })
    @Column({ comment: '部门ID', length: 32, nullable: false })
    deptId: string

    @ApiProperty({ description: '员工ID', example: '2149446185344106496' })
    @IsNotEmpty({ message: 'staffId必填' })
    @Column({ comment: '员工ID', length: 32, nullable: false })
    staffId: string
}
