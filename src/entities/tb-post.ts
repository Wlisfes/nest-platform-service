import { Entity, Column } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsEnum } from 'class-validator'
import { CommonEntier } from '@/utils/utils-typeorm'
import * as enums from '@/enums/instance'

@Entity({ name: 'tb_post', comment: '职位表' })
export class tbPost extends CommonEntier {
    @ApiProperty({ description: '职位ID', example: '858619496' })
    @IsNotEmpty({ message: '职位ID必填' })
    @Column({ comment: '职位ID', length: 32, nullable: false })
    postId: string

    @ApiProperty({ description: '职位名称', example: '业务员' })
    @IsNotEmpty({ message: '职位名称必填' })
    @Column({ comment: '职位名称', length: 32, nullable: false })
    title: string

    @ApiProperty({ description: '职位状态: 启用-enable、禁用-disable、删除-delete', enum: enums.PostState })
    @IsNotEmpty({ message: '职位状态必填' })
    @IsEnum(enums.PostState, { message: '员工状态参数格式错误' })
    @Column({ comment: '职位状态: 启用-enable、禁用-disable、删除-delete', default: enums.PostState.enable, nullable: false })
    state: string
}

@Entity({ name: 'tb_post_member', comment: '员工职位表' })
export class tbPostMember extends CommonEntier {
    @ApiProperty({ description: '职位ID', example: '858619496' })
    @IsNotEmpty({ message: '职位ID必填' })
    @Column({ comment: '职位ID', length: 32, nullable: false })
    postId: string

    @ApiProperty({ description: '员工ID', example: '2149446185344106496' })
    @IsNotEmpty({ message: 'staffId必填' })
    @Column({ comment: '员工ID', length: 32, nullable: false })
    staffId: string
}
