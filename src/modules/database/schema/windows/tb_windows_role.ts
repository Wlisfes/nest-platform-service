import { Entity, Column } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, Length, IsNumber, IsEnum, IsOptional } from 'class-validator'
import { DataBaseByAdapter, withProperty, withComment } from '@/modules/database/database.adapter'
import { COMMON_WINDOWS_ROLE } from '@/modules/database/enums'
import { Type } from 'class-transformer'

@Entity({ name: 'tb_windows_role', comment: '管理端-角色配置表' })
export class WindowsRole extends DataBaseByAdapter {
    @ApiProperty({ description: '角色名称', example: '管理员' })
    @IsNotEmpty({ message: '角色名称必填' })
    @Length(0, 32, { message: '角色名称不能超过32个字符' })
    @Column({ comment: '角色名称', length: 32, nullable: false })
    name: string

    @ApiProperty({ description: '角色描述', required: false })
    @IsOptional()
    @Length(0, 128, { message: '角色描述不能超过128个字符' })
    @Column({ name: 'comment', comment: '角色描述', length: 128, nullable: true })
    comment: string

    @ApiProperty({ description: '排序号', example: 0 })
    @IsNumber({}, { message: '排序号必须为number' })
    @Type(() => Number)
    @Column({ comment: '排序号', default: 0, nullable: false })
    sort: number

    @ApiProperty({ description: '角色数据权限', enum: withProperty(COMMON_WINDOWS_ROLE.model) })
    @IsNotEmpty({ message: '角色数据权限必填' })
    @Length(0, 32, { message: '角色数据权限不能超过32个字符' })
    @IsEnum(Object.keys(COMMON_WINDOWS_ROLE.model), { message: '角色数据权限格式错误' })
    @Column({ nullable: false, comment: withComment('角色数据权限', COMMON_WINDOWS_ROLE.model) })
    model: string
}

@Entity({ name: 'tb_windows_role_account', comment: '管理端-角色关联账号表' })
export class WindowsRoleAccount extends DataBaseByAdapter {
    @ApiProperty({ description: '角色ID', example: 1000 })
    @IsNotEmpty({ message: '角色ID必填' })
    @Column({ name: 'role_id', comment: '角色ID', nullable: false })
    roleId: number

    @ApiProperty({ description: '账号UID', example: '2149446185344106496' })
    @IsNotEmpty({ message: '账号UID必填' })
    @Column({ comment: '账号UID', length: 19, nullable: false })
    uid: string
}

@Entity({ name: 'tb_windows_role_resource', comment: '管理端-角色菜单资源表' })
export class WindowsRoleResource extends DataBaseByAdapter {
    @ApiProperty({ description: '角色ID', example: 1000 })
    @IsNotEmpty({ message: '角色ID必填' })
    @Column({ name: 'role_id', comment: '角色ID', nullable: false })
    roleId: number

    @ApiProperty({ description: '菜单资源ID', example: 1000 })
    @IsNotEmpty({ message: '菜单资源ID必填' })
    @Column({ comment: '菜单资源ID', nullable: false })
    sid: number
}

@Entity({ name: 'tb_windows_role_sheet', comment: '管理端-角色按钮权限关联表' })
export class WindowsRoleSheet extends DataBaseByAdapter {
    @ApiProperty({ description: '角色ID', example: 1000 })
    @IsNotEmpty({ message: '角色ID必填' })
    @Column({ name: 'role_id', comment: '角色ID', nullable: false })
    roleId: number

    @ApiProperty({ description: '按钮权限ID', example: 1000 })
    @IsNotEmpty({ message: '按钮权限ID必填' })
    @Column({ name: 'sheet_id', comment: '按钮权限ID', nullable: false })
    sheetId: number
}

@Entity({ name: 'tb_windows_role_apifox', comment: '管理端-角色接口权限关联表' })
export class WindowsRoleApifox extends DataBaseByAdapter {
    @ApiProperty({ description: '角色ID', example: 1000 })
    @IsNotEmpty({ message: '角色ID必填' })
    @Column({ name: 'role_id', comment: '角色ID', nullable: false })
    roleId: number

    @ApiProperty({ description: '接口权限ID', example: 1000 })
    @IsNotEmpty({ message: '接口权限ID必填' })
    @Column({ name: 'apifox_id', comment: '接口权限ID', nullable: false })
    apifoxId: number
}
