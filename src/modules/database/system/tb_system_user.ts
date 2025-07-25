import { Entity, Column } from 'typeorm'
import { hashSync } from 'bcryptjs'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, Length, IsEmail, IsEnum } from 'class-validator'
import { IsMobile } from '@/decorator/common.decorator'
import { DatabaseAdapter } from '@/modules/database/database.adapter'
import { comment } from '@/utils/utils-schema'
import { fetchComment } from '@/utils/utils-common'
import * as enums from '@/modules/database/database.enums'

@Entity({ name: 'tb_system_user', comment: '用户表' })
export class SchemaUser extends DatabaseAdapter {
    @ApiProperty({ description: 'UID', example: '2149446185344106496' })
    @IsNotEmpty({ message: 'UID必填' })
    @Column({ comment: '唯一UUID', length: 19, nullable: false })
    uid: string

    @ApiProperty({ description: '工号', example: '1234' })
    @IsNotEmpty({ message: '工号必填' })
    @Length(4, 4, { message: '工号必须保持4位' })
    @Column({ comment: '工号', length: 32, nullable: false })
    number: string

    @ApiProperty({ description: '手机号', example: '18888888888' })
    @IsNotEmpty({ message: '手机号必填' })
    @IsMobile({ message: '手机号格式错误' })
    @Column({ type: 'varchar', comment: '手机号', length: 32, nullable: false })
    phone: string

    @ApiProperty({ description: '邮箱', example: 'limvcfast@gmail.com' })
    @IsNotEmpty({ message: '邮箱必填' })
    @IsEmail({}, { message: '邮箱格式错误' })
    @Column({ comment: '邮箱', length: 128, nullable: true })
    email: string

    @ApiProperty({ description: '姓名', example: '妖雨纯' })
    @IsNotEmpty({ message: '姓名必填' })
    @Length(2, 32, { message: '姓名必须保持2~32位' })
    @Column({ comment: '姓名', length: 32, nullable: false })
    name: string

    @ApiProperty({ description: '头像' })
    @IsNotEmpty({ message: '头像必填' })
    @Column({ comment: '头像', length: 255, nullable: true })
    avatar: string

    @ApiProperty({ description: '账号状态', enum: fetchComment(enums.COMMON_SYSTEM_USER_STATUS) })
    @IsNotEmpty({ message: '账号状态必填' })
    @Length(0, 32, { message: '账号状态不能超过32个字符' })
    @IsEnum(Object.keys(enums.COMMON_SYSTEM_USER_STATUS), { message: '账号状态格式错误' })
    @Column({ nullable: false, comment: comment('账号状态', enums.COMMON_SYSTEM_USER_STATUS) })
    status: string

    @ApiProperty({ description: '密码', example: 'MTIzNDU2' })
    @IsNotEmpty({ message: '密码必填' })
    @Length(6, 32, { message: '密码必须保持6~32位' })
    @Column({
        comment: '密码',
        select: false,
        nullable: false,
        transformer: { from: value => value, to: value => hashSync(value) }
    })
    password: string
}
