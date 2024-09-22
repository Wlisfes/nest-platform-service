import { Entity, Column } from 'typeorm'
import { hashSync } from 'bcryptjs'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, Length, IsEmail, IsEnum } from 'class-validator'
import { CommonEntier } from '@/utils/utils-typeorm'
import * as enums from '@/enums/instance'

@Entity({ name: 'tb_user', comment: '用户表' })
export class tbUser extends CommonEntier {
    @ApiProperty({ description: 'UID', example: '2149446185344106496' })
    @IsNotEmpty({ message: 'UID必填' })
    @Column({ comment: '唯一UUID', length: 32, nullable: false })
    uid: string

    @ApiProperty({ description: '昵称', example: '妖雨纯' })
    @IsNotEmpty({ message: '昵称必填' })
    @Length(2, 32, { message: '昵称必须保持2~32位' })
    @Column({ comment: '昵称', length: 32, nullable: false })
    nickname: string

    @ApiProperty({ description: '头像' })
    @IsNotEmpty({ message: '头像必填' })
    @Length(4, 255, { message: '头像地址必须保持4~255位' })
    @Column({ comment: '头像', nullable: false })
    avatar: string

    @ApiProperty({ description: '邮箱', example: 'limvcfast@gmail.com' })
    @IsNotEmpty({ message: '邮箱必填' })
    @IsEmail({}, { message: '邮箱格式错误' })
    @Length(4, 32, { message: '邮箱必须保持4~64位' })
    @Column({ comment: '邮箱', length: 64, nullable: false })
    email: string

    @ApiProperty({ description: '用户状态: 禁用-disable、启用-enable、挂起-suspend', enum: enums.UserState })
    @IsNotEmpty({ message: '用户状态必填' })
    @IsEnum(enums.UserState, { message: '用户状态参数格式错误' })
    @Column({ comment: '用户状态: 禁用-disable、启用-enable、挂起-suspend', default: enums.UserState.enable, nullable: false })
    state: string

    @ApiProperty({ description: '密码', example: 'MTIzNDU2' })
    @IsNotEmpty({ message: '密码必填' })
    @Length(6, 64, { message: '密码必须保持6~64位' })
    @Column({
        comment: '密码',
        length: 255,
        select: false,
        nullable: false,
        transformer: { from: value => value, to: value => hashSync(value) }
    })
    password: string
}
