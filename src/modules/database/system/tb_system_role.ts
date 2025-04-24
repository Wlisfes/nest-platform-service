import { Entity, Column } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, Length, IsString, IsArray, IsOptional } from 'class-validator'
import { Type } from 'class-transformer'
import { DatabaseAdapter } from '@/modules/database/database.adapter'
import { ArrayStringTransform } from '@/utils/utils-schema'

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
    @Type(() => String)
    @IsOptional()
    @IsArray()
    @IsString({ each: true, message: 'uids 格式错误' })
    @Column({ type: 'text', nullable: true, transformer: ArrayStringTransform })
    uids: string[]

    @ApiProperty({ description: '权限列表' })
    @Type(() => String)
    @IsOptional()
    @IsArray()
    @IsString({ each: true, message: 'auxs 格式错误' })
    @Column({ type: 'text', nullable: true, transformer: ArrayStringTransform })
    auxs: string[]

    @ApiProperty({ description: '状态: 禁用-disable、启用-enable' })
    @IsNotEmpty({ message: '状态必填' })
    @Length(0, 32, { message: '账号状态不能超过32个字符' })
    @Column({ comment: '状态: 禁用-disable、启用-enable', nullable: false })
    status: string
}
