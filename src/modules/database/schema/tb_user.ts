import { Entity, Column } from 'typeorm'
import { hashSync } from 'bcryptjs'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, Length, IsEmail, IsEnum } from 'class-validator'
import { DatabaseAdapter } from '@/modules/database/database.adapter'
import * as enums from '@/modules/database/database.enums'

@Entity({ name: 'tb_user', comment: '用户表' })
export class SchemaUser extends DatabaseAdapter {
    @ApiProperty({ description: 'UID', example: '2149446185344106496' })
    @IsNotEmpty({ message: 'UID必填' })
    @Column({ comment: '唯一UUID', length: 19, nullable: false })
    uid: string

    @ApiProperty({ description: '账号', example: '88888888' })
    @IsNotEmpty({ message: '账号必填' })
    @Length(8, 11, { message: '账号必须保持8~11位' })
    @Column('int', { comment: '账号', nullable: false })
    account: number

    @ApiProperty({ description: '昵称', example: '妖雨纯' })
    @IsNotEmpty({ message: '昵称必填' })
    @Length(2, 32, { message: '昵称必须保持2~32位' })
    @Column({ comment: '昵称', length: 32, nullable: false })
    nickname: string

    @ApiProperty({ description: '头像' })
    @IsNotEmpty({ message: '头像必填' })
    @Length(4, 255, { message: '头像地址必须保持4~255位' })
    @Column({ comment: '头像', length: 255, nullable: true })
    avatar: string

    @ApiProperty({ description: '邮箱', example: 'limvcfast@gmail.com' })
    @IsNotEmpty({ message: '邮箱必填' })
    @IsEmail({}, { message: '邮箱格式错误' })
    @Length(4, 32, { message: '邮箱必须保持4~64位' })
    @Column({ comment: '邮箱', length: 64, nullable: true })
    email: string

    @ApiProperty({ description: '是否系统账号', example: false })
    @IsNotEmpty({ message: '是否系统账号 必填' })
    @Column({ comment: '是否系统账号', nullable: false })
    system: boolean

    @ApiProperty({ description: '账号状态: 禁用-disable、启用-enable、挂起-suspend', enum: enums.SchemaUser_Status })
    @IsNotEmpty({ message: '账号状态必填' })
    @IsEnum(enums.SchemaUser_Status, { message: '账号状态参数格式错误' })
    @Column({ comment: '账号状态: 禁用-disable、启用-enable、挂起-suspend', default: enums.SchemaUser_Status.enable, nullable: false })
    status: string

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
