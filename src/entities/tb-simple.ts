import { Entity, Column } from 'typeorm'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsNotEmpty, isNotEmpty, IsEnum, IsNumber, IsObject } from 'class-validator'
import { IsOptional } from '@/decorator/common.decorator'
import { CommonEntier } from '@/utils/utils-typeorm'
import * as enums from '@/enums/instance'

@Entity({ name: 'tb_simple', comment: '字典表' })
export class tbSimple extends CommonEntier {
    @ApiProperty({ description: '字典名称', example: '业务员' })
    @IsNotEmpty({ message: '字典名称必填' })
    @Column({ comment: '字典名称', length: 32 })
    name: string

    @ApiProperty({ description: '字典类型', enum: enums.SimpleStalk })
    @IsNotEmpty({ message: '字典类型必填' })
    @IsEnum(enums.SimpleStalk, { message: '字典类型参数格式错误' })
    @Column({ comment: '字典类型' })
    stalk: string

    @ApiPropertyOptional({ description: '备注' })
    @IsOptional()
    @Column({ comment: '字典值', length: 255, default: null, nullable: true })
    comment: string

    @ApiProperty({ description: '员工ID' })
    @IsNotEmpty({ message: '员工ID必填' })
    @Column({ comment: '员工ID', length: 32 })
    staffId: string
}

@Entity({ name: 'tb_simple_column', comment: '字典配置表' })
export class tbSimpleColumn extends CommonEntier {
    @ApiProperty({ description: '字典类型ID' })
    @IsNotEmpty({ message: '字典类型ID必填' })
    @Column({ comment: '字典类型ID', length: 32 })
    sid: string

    @ApiProperty({ description: '上级字典ID' })
    @IsNotEmpty({ message: '上级字典ID必填' })
    @Column({ comment: '上级字典ID', length: 32, nullable: true })
    pid: string

    @ApiProperty({ description: '字典名称', example: '业务员' })
    @IsNotEmpty({ message: '字典名称必填' })
    @Column({ comment: '字典名称', length: 32 })
    name: string

    @ApiProperty({ description: '字典值' })
    @IsNotEmpty({ message: '字典值必填' })
    @Column({ comment: '字典值', length: 64 })
    value: string

    @ApiProperty({ description: '是否可编辑' })
    @IsNotEmpty({ message: '是否可编辑必填' })
    @Column({ comment: '是否可编辑', default: true })
    update: boolean

    @ApiProperty({ description: '字典排序' })
    @IsNumber({}, { message: '字典排序必须为number' })
    @Type(() => Number)
    @Column({ comment: '字典排序', default: 0 })
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
    @ApiProperty({ description: '员工ID' })
    @IsNotEmpty({ message: 'staffId必填' })
    @Column({ comment: '员工ID', length: 32, nullable: false })
    staffId: string
}

@Entity({ name: 'tb_simple_rank_member', comment: '员工职级表' })
export class tbSimpleRankMember extends CommonEntier {
    @ApiProperty({ description: '员工ID' })
    @IsNotEmpty({ message: 'staffId必填' })
    @Column({ comment: '员工ID', length: 32, nullable: false })
    staffId: string
}
