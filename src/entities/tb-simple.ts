import { Entity, Column } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsNotEmpty, isNotEmpty, IsEnum, IsNumber, IsObject } from 'class-validator'
import { CommonEntier } from '@/utils/utils-typeorm'
import * as enums from '@/enums/instance'

@Entity({ name: 'tb_simple', comment: '字典表' })
export class tbSimple extends CommonEntier {
    @ApiProperty({ description: '字典ID', example: '34754938454' })
    @IsNotEmpty({ message: '字典ID必填' })
    @Column({ comment: '字典ID', length: 11, nullable: false })
    id: string

    @ApiProperty({ description: '字典名称', example: '业务员' })
    @IsNotEmpty({ message: '字典名称必填' })
    @Column({ comment: '字典名称', length: 32, nullable: false })
    name: string

    @ApiProperty({ description: '上级字典ID' })
    @IsNotEmpty({ message: '上级字典ID必填' })
    @Column({ comment: '上级字典ID', length: 11, nullable: true })
    pid: string

    @ApiProperty({ description: '字典类型', enum: enums.SimpleStalk })
    @IsNotEmpty({ message: '字典类型必填' })
    @IsEnum(enums.SimpleStalk, { message: '字典类型参数格式错误' })
    @Column({ comment: '字典类型', nullable: false })
    stalk: string

    @ApiProperty({ description: '员工ID' })
    @IsNotEmpty({ message: '员工ID必填' })
    @Column({ comment: '员工ID', length: 32, nullable: false })
    staffId: string

    @ApiProperty({ description: '字典状态: 启用-enable、禁用-disable、删除-delete', enum: enums.SimpleStatus })
    @IsNotEmpty({ message: '字典状态必填' })
    @IsEnum(enums.SimpleStatus, { message: '字典状态参数格式错误' })
    @Column({ comment: '字典状态: 启用-enable、禁用-disable、删除-delete', default: enums.SimpleStatus.enable, nullable: false })
    ststus: string

    @ApiProperty({ description: '字典排序' })
    @IsNumber({}, { message: '字典排序必须为number' })
    @Type(() => Number)
    @Column({ comment: '字典排序', default: 0, nullable: false })
    sort: number

    @ApiProperty({ description: '字典额外配置' })
    @IsObject({ message: '字典额外配置必须为JSON数据格式' })
    @Column({
        type: 'simple-json',
        comment: '字典额外配置',
        nullable: true,
        transformer: {
            from: value => (isNotEmpty(value) ? JSON.parse(value) : {}),
            to: value => (isNotEmpty(value) ? JSON.stringify(value) : null)
        }
    })
    state: Object
}

@Entity({ name: 'tb_simple_post_member', comment: '员工职位表' })
export class tbSimplePostMember extends CommonEntier {
    @ApiProperty({ description: '字典ID', example: '34754938454' })
    @IsNotEmpty({ message: '字典ID必填' })
    @Column({ comment: '字典ID', length: 11, nullable: false })
    id: string

    @ApiProperty({ description: '员工ID', example: '2149446185344106496' })
    @IsNotEmpty({ message: 'staffId必填' })
    @Column({ comment: '员工ID', length: 32, nullable: false })
    staffId: string
}

@Entity({ name: 'tb_simple_rank_member', comment: '员工职级表' })
export class tbSimpleRankMember extends CommonEntier {
    @ApiProperty({ description: '字典ID', example: '34754938454' })
    @IsNotEmpty({ message: '字典ID必填' })
    @Column({ comment: '字典ID', length: 11, nullable: false })
    id: string

    @ApiProperty({ description: '员工ID', example: '2149446185344106496' })
    @IsNotEmpty({ message: 'staffId必填' })
    @Column({ comment: '员工ID', length: 32, nullable: false })
    staffId: string
}
