import { Entity, Column } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsNotEmpty, Length, IsEnum, IsObject } from 'class-validator'
import { IsOptional } from '@/decorator/common.decorator'
import { DatabaseAdapter } from '@/modules/database/database.adapter'
import { JsonStringTransform } from '@/utils/utils-schema'
import * as enums from '@/modules/database/database.enums'

@Entity({ name: 'tb_system_chunk', comment: '字典配置表' })
export class SchemaChunk extends DatabaseAdapter {
    @ApiProperty({ description: 'ID', example: '2280241553538613248' })
    @IsNotEmpty({ message: 'ID必填' })
    @Column({ name: 'key_id', comment: '唯一ID', length: 19, nullable: false })
    keyId: string

    @ApiProperty({ description: '用户UID', example: '2149446185344106496' })
    @IsNotEmpty({ message: '用户UID必填' })
    @Column({ comment: '用户UID', length: 19, nullable: false })
    uid: string

    @ApiProperty({ description: '字典类型', enum: Object.keys(enums.SCHEMA_CHUNK_OPTIONS) })
    @IsNotEmpty({ message: '字典类型必填' })
    @Length(0, 32, { message: '字典类型不能超过32个字符' })
    @IsEnum(Object.keys(enums.SCHEMA_CHUNK_OPTIONS), { message: '字典类型格式错误' })
    @Column({ comment: '字典类型', length: 32, nullable: false })
    type: string

    @ApiProperty({ description: '字典状态', enum: Object.keys(enums.SCHEMA_CHUNK_STATUS_OPTIONS) })
    @IsNotEmpty({ message: '字典状态必填' })
    @Length(0, 32, { message: '字典状态不能超过32个字符' })
    @IsEnum(Object.keys(enums.SCHEMA_CHUNK_STATUS_OPTIONS), { message: '字典状态格式错误' })
    @Column({ comment: '字典状态', length: 32, nullable: false })
    status: string

    @ApiProperty({ description: '字典名称', example: '账号状态' })
    @IsNotEmpty({ message: '字典名称必填' })
    @Length(0, 32, { message: '字典名称不能超过32个字符' })
    @Column({ comment: '字典名称', length: 32, nullable: false })
    name: string

    @ApiProperty({ description: '字典值', example: 'enable' })
    @IsNotEmpty({ message: '字典值必填' })
    @Length(0, 32, { message: '字典值不能超过32个字符' })
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

    @ApiProperty({ description: '字典备注', required: false })
    @IsOptional({}, { string: true, number: true })
    @Length(0, 255, { message: '字典备注不能超过255个字符' })
    @Column({ comment: '字典备注', length: 255, nullable: true })
    comment: string

    @ApiProperty({ description: '字典其他配置', required: false, example: {} })
    @IsOptional()
    @IsObject({ message: '其他配置必须为json格式' })
    @Column({ type: 'text', comment: '字典其他配置', nullable: true, transformer: JsonStringTransform })
    json: string
}
