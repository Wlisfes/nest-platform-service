import { Entity, Column } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, isNotEmpty, IsEnum } from 'class-validator'
import { CommonEntier } from '@/utils/utils-typeorm'
import * as enums from '@/enums/instance'

@Entity({ name: 'tb_simple', comment: '字典表' })
export class tbSimple extends CommonEntier {
    @ApiProperty({ description: '字典ID', example: '34754938454' })
    @IsNotEmpty({ message: '字典ID必填' })
    @Column({ comment: '字典ID', length: 11, nullable: false })
    sid: string

    @ApiProperty({ description: '字典名称', example: '业务员' })
    @IsNotEmpty({ message: '字典名称必填' })
    @Column({ comment: '字典名称', length: 32, nullable: false })
    name: string

    @ApiProperty({ description: '上级字典ID', example: '34754938454' })
    @IsNotEmpty({ message: '上级字典ID必填' })
    @Column({ comment: '上级字典ID', length: 11, nullable: true })
    pid: string

    @ApiProperty({ description: '字典类型', enum: enums.SimpleStalk })
    @IsNotEmpty({ message: '字典类型必填' })
    @IsEnum(enums.SimpleStalk, { message: '字典类型参数格式错误' })
    @Column({ comment: '字典类型', nullable: false })
    stalk: string

    @ApiProperty({ description: '字典状态: 启用-enable、禁用-disable、删除-delete', enum: enums.SimpleState })
    @IsNotEmpty({ message: '字典状态必填' })
    @IsEnum(enums.SimpleState, { message: '字典状态参数格式错误' })
    @Column({ comment: '字典状态: 启用-enable、禁用-disable、删除-delete', default: enums.SimpleState.enable, nullable: false })
    state: string

    @ApiProperty({ description: '字典额外配置' })
    @Column({
        type: 'simple-json',
        comment: '字典额外配置',
        nullable: true,
        transformer: {
            from: value => (isNotEmpty(value) ? JSON.parse(value) : null),
            to: value => (isNotEmpty(value) ? JSON.stringify(value) : null)
        }
    })
    props: Object
}
