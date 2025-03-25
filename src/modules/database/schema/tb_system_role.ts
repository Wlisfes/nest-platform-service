import { Entity, Column } from 'typeorm'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsEnum, IsString, IsArray } from 'class-validator'
import { Type } from 'class-transformer'
import { IsOptional } from '@/decorator/common.decorator'
import { DatabaseAdapter } from '@/modules/database/database.adapter'
import * as enums from '@/modules/database/database.enums'

@Entity({ name: 'tb_system_role', comment: '角色权限配置表' })
export class SchemaRole extends DatabaseAdapter {
    @ApiProperty({ description: 'ID', example: '2280241553538613248' })
    @IsNotEmpty({ message: 'ID必填' })
    @Column({ name: 'key_id', comment: '唯一ID', length: 19, nullable: false })
    keyId: string

    @ApiProperty({ description: '用户UID', example: '2149446185344106496' })
    @IsNotEmpty({ message: '用户UID必填' })
    @Column({ comment: '用户UID', length: 19, nullable: false })
    uid: string

    @ApiProperty({ description: '角色名称', example: '管理员' })
    @IsNotEmpty({ message: '角色名称必填' })
    @Column({ comment: '角色名称', length: 32, nullable: false })
    name: string

    @ApiProperty({ description: '用户列表' })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @Column({
        type: 'text',
        nullable: true,
        transformer: { from: s => s.toString().split(','), to: s => s.join(',') }
    })
    uids: string[]

    @ApiProperty({ description: '权限列表' })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @Column({
        type: 'text',
        nullable: true,
        transformer: { from: s => s.toString().split(','), to: s => s.join(',') }
    })
    kyes: string[]

    @ApiProperty({
        description: '状态: 禁用-disable、启用-enable',
        enum: enums.SchemaSystemRole_Status,
        example: enums.SchemaSystemRole_Status.enable
    })
    @IsNotEmpty({ message: '状态必填' })
    @IsEnum(enums.SchemaSystemRole_Status, { message: '状态参数格式错误' })
    @Column({ comment: '状态: 禁用-disable、启用-enable', default: enums.SchemaSystemRole_Status.enable, nullable: false })
    status: string
}
