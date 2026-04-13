import { Entity, Column } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, Length, IsEnum } from 'class-validator'
import { DataBaseByAdapter, withKeys, withComment } from '@/modules/database/database.adapter'
import * as enums from '@/modules/database/enums'

@Entity({ name: 'tb_windows_chunk', comment: '管理端-字段自定义显示规则' })
export class WindowsChunk extends DataBaseByAdapter {
    @ApiProperty({ description: '权限标识', example: 'chatbok:manager' })
    @IsNotEmpty({ message: '权限标识必填' })
    @Length(0, 128, { message: '权限标识不能超过128个字符' })
    @Column({ type: 'varchar', name: 'key_name', comment: '权限标识', length: 128, nullable: false })
    keyName: string

    @ApiProperty({
        description: withComment('类型', enums.CHUNK_WINDOWS_COMMON_CHUNK),
        example: enums.CHUNK_WINDOWS_COMMON_CHUNK.search.value
    })
    @IsNotEmpty({ message: '类型必填' })
    @Length(0, 32, { message: '类型不能超过32个字符' })
    @IsEnum(withKeys(enums.CHUNK_WINDOWS_COMMON_CHUNK), { message: '类型格式错误' })
    @Column({ nullable: false, comment: withComment('类型', enums.CHUNK_WINDOWS_COMMON_CHUNK) })
    chunk: string

    @ApiProperty({ description: '字段', example: 'name' })
    @IsNotEmpty({ message: '字段必填' })
    @Length(0, 64, { message: '字段不能超过64个字符' })
    @Column({ type: 'varchar', comment: '字段', length: 64, nullable: false })
    prop: string

    @ApiProperty({ description: '字段名称', example: '名称' })
    @IsNotEmpty({ message: '字段名称必填' })
    @Length(0, 64, { message: '字段名称不能超过64个字符' })
    @Column({ type: 'varchar', comment: '字段名称', length: 64, nullable: false })
    label: string

    @ApiProperty({ description: '字段可见：true-可见，false-不可见', example: 'true' })
    @IsNotEmpty({ message: '字段可见必填' })
    @Column({ type: 'boolean', comment: '字段可见', nullable: false })
    check: boolean
}
