import { Entity, Column } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, Length, IsEnum, IsOptional } from 'class-validator'
import { DatabaseAdapter } from '@/modules/database/database.adapter'
import { comment } from '@/utils/utils-schema'
import { fetchComment } from '@/utils/utils-common'
import * as enums from '@/modules/database/database.enums'

@Entity({ name: 'tb_system_role', comment: '角色配置表' })
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

    @ApiProperty({ description: '角色状态', enum: fetchComment(enums.COMMON_SYSTEM_ROLE_STATUS) })
    @IsNotEmpty({ message: '角色状态必填' })
    @Length(0, 32, { message: '角色状态不能超过32个字符' })
    @IsEnum(Object.keys(enums.COMMON_SYSTEM_ROLE_STATUS), { message: '角色状态格式错误' })
    @Column({ nullable: false, comment: comment('角色状态', enums.COMMON_SYSTEM_ROLE_STATUS) })
    status: string

    @ApiProperty({ description: '角色描述', required: false })
    @IsOptional()
    @Length(0, 128, { message: '角色描述不能超过128个字符' })
    @Column({ name: 'comment', comment: '角色描述', length: 128, nullable: true })
    comment: string
}

@Entity({ name: 'tb_system_role_join_user', comment: '角色关联用户配置表' })
export class SchemaRoleUser extends DatabaseAdapter {
    @ApiProperty({ description: '角色ID', example: '2280241553538613248' })
    @IsNotEmpty({ message: '角色ID必填' })
    @Column({ name: 'key_id', comment: '角色ID', length: 19, nullable: false })
    keyId: string

    @ApiProperty({ description: '用户UID', example: '2149446185344106496' })
    @IsNotEmpty({ message: '用户UID必填' })
    @Column({ comment: '用户UID', length: 19, nullable: false })
    uid: string
}

@Entity({ name: 'tb_system_role_join_router', comment: '角色关联菜单资源配置表' })
export class SchemaRoleRouter extends DatabaseAdapter {
    @ApiProperty({ description: '角色ID', example: '2280241553538613248' })
    @IsNotEmpty({ message: '角色ID必填' })
    @Column({ name: 'key_id', comment: '角色ID', length: 19, nullable: false })
    keyId: string

    @ApiProperty({ description: '菜单资源ID', example: '2149446185344106496' })
    @IsNotEmpty({ message: '菜单资源ID必填' })
    @Column({ comment: '菜单资源ID', length: 19, nullable: false })
    sid: string
}
