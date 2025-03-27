import { Entity, Column } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsNotEmpty, Max, IsObject } from 'class-validator'
import { IsOptional } from '@/decorator/common.decorator'
import { DatabaseAdapter } from '@/modules/database/database.adapter'
import { JsonStringTransform } from '@/utils/utils-schema'

@Entity({ name: 'tb_system_dict', comment: '字典配置表' })
export class SchemaDict extends DatabaseAdapter {
    @ApiProperty({ description: 'ID', example: '2280241553538613248' })
    @IsNotEmpty({ message: 'ID必填' })
    @Column({ name: 'key_id', comment: '唯一ID', length: 19, nullable: false })
    keyId: string

    @ApiProperty({ description: '字典类型', example: '管理员' })
    @IsNotEmpty({ message: '字典类型必填' })
    @Column({ comment: '字典类型', length: 32, nullable: false })
    type: string

    @ApiProperty({ description: '字典名称', example: '管理员' })
    @IsNotEmpty({ message: '字典名称必填' })
    @Column({ comment: '字典名称', length: 32, nullable: false })
    name: string

    @ApiProperty({ description: '字典值', example: '管理员' })
    @IsNotEmpty({ message: '字典值必填' })
    @Column({ comment: '字典值名称', length: 32, nullable: false })
    value: string

    @ApiProperty({ description: '字典禁止修改' })
    @Type(() => Boolean)
    @IsOptional()
    @Column({ comment: '字典禁止修改', nullable: false, default: false })
    disabled: boolean

    @ApiProperty({ description: '上级ID', required: false })
    @IsOptional()
    @Column({ comment: '上级ID', length: 19, nullable: true })
    pid: string

    @ApiProperty({ description: '字典备注' })
    @IsOptional()
    @Max(255, { message: '字典备注不能超过255个字符' })
    @Column({ comment: '字典备注', length: 255, nullable: true })
    comment: string

    @ApiProperty({ description: '字典其他配置' })
    @IsOptional()
    @IsObject({ message: '字典其他配置必须为json格式' })
    @Column({ type: 'text', comment: '字典其他配置', nullable: true, transformer: JsonStringTransform })
    json: string
}
