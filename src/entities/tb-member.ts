import { Entity, Column } from 'typeorm'
import { hashSync } from 'bcryptjs'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, Length } from 'class-validator'
import { CommonEntier } from '@/utils/utils-typeorm'

@Entity({ name: 'tb_member', comment: '员工表' })
export class tbMember extends CommonEntier {
    @ApiProperty({ description: '员工ID', example: '2149446185344106496' })
    @IsNotEmpty({ message: '员工ID必填' })
    @Column({ comment: '员工ID', length: 32, nullable: false })
    uid: string

    @ApiProperty({ description: '员工姓名', example: '妖雨纯' })
    @IsNotEmpty({ message: '员工姓名必填' })
    @Length(2, 32, { message: '员工姓名必须保持2~32位' })
    @Column({ comment: '员工姓名', length: 32, nullable: false })
    name: string

    @ApiProperty({ description: '员工工号', example: '0001' })
    @IsNotEmpty({ message: '员工工号必填' })
    @Length(2, 32, { message: '员工工号必须保持2~32位' })
    @Column({ comment: '员工工号', length: 32, nullable: false })
    jobNumber: string

    @ApiProperty({ description: '头像' })
    @IsNotEmpty({ message: '头像必填' })
    @Length(4, 255, { message: '头像地址必须保持4~255位' })
    @Column({ comment: '头像', nullable: true })
    avatar: string

    @ApiProperty({ description: '员工状态' })
    @IsNotEmpty({ message: '员工状态必填' })
    @Column({ comment: '员工状态', default: 'online', nullable: false })
    status: string

    @ApiProperty({ description: '密码', example: 'MTIzNDU2' })
    @IsNotEmpty({ message: '密码必填' })
    @Length(6, 18, { message: '密码必须保持6~18位' })
    @Column({
        comment: '密码',
        length: 255,
        select: false,
        nullable: false,
        transformer: { from: value => value, to: value => hashSync(value) }
    })
    password: string
}
