import { Entity, Column } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsNotEmpty, Length, IsEnum, IsNumber, IsOptional } from 'class-validator'
import { DataBaseByAdapter, withKeys, withComment } from '@/modules/database/database.adapter'
import * as enums from '@/modules/database/enums'

@Entity({ name: 'tb_windows_sheet', comment: '管理端-菜单管理' })
export class WindowsSheet extends DataBaseByAdapter {
    @ApiProperty({ description: 'ID', example: '2149446185344106496' })
    @IsNotEmpty({ message: 'ID必填' })
    @Column({ comment: '唯一ID', update: false, length: 32, nullable: false })
    id: string

    @ApiProperty({ description: '权限标识', example: 'chatbok:manager' })
    @IsNotEmpty({ message: '权限标识必填' })
    @Length(0, 128, { message: '权限标识不能超过128个字符' })
    @Column({ name: 'key_name', comment: '权限标识', length: 128, nullable: false })
    keyName: string

    @ApiProperty({ description: '名称', example: '工作台' })
    @IsNotEmpty({ message: '名称必填' })
    @Length(0, 32, { message: '名称不能超过32个字符' })
    @Column({ comment: '名称', length: 32, nullable: false })
    name: string

    @ApiProperty({ description: '地址', example: '/manager' })
    @IsNotEmpty({ message: '地址必填' })
    @Length(0, 255, { message: '菜单地址不能超过255个字符' })
    @Column({ comment: '地址', length: 255, nullable: true })
    router: string

    @ApiProperty({ description: '图标', required: false, example: 'nest-settings' })
    @IsOptional()
    @Length(0, 64, { message: '图标不能超过64个字符' })
    @Column({ name: 'icon_name', comment: '图标', length: 64, nullable: true })
    iconName: string

    @ApiProperty({ description: '上级ID', required: false, example: '2149446185344106496' })
    @IsOptional()
    @Column({ comment: '上级ID', length: 32, nullable: true })
    pid: string

    @ApiProperty({ description: '版本号', example: 'v1.0.0' })
    @IsNotEmpty({ message: '版本号必填' })
    @Length(0, 32, { message: '版本号不能超过32个字符' })
    @Column({ comment: '版本号', length: 32, default: 'v1.0.0', nullable: false })
    version: string

    @ApiProperty({ description: '排序号', example: 0 })
    @IsNumber({}, { message: '排序号必须为number' })
    @Type(() => Number)
    @Column({ comment: '排序号', default: 0, nullable: false })
    sort: number

    @ApiProperty({ description: withComment('类型', enums.CHUNK_WINDOWS_SHEET_CHUNK) })
    @IsNotEmpty({ message: '类型必填' })
    @Length(0, 32, { message: '类型不能超过32个字符' })
    @IsEnum(withKeys(enums.CHUNK_WINDOWS_SHEET_CHUNK), { message: '类型格式错误' })
    @Column({ nullable: false, comment: withComment('类型', enums.CHUNK_WINDOWS_SHEET_CHUNK) })
    chunk: string

    @ApiProperty({ description: withComment('状态', enums.CHUNK_WINDOWS_SHEET_STATUS) })
    @IsNotEmpty({ message: '状态必填' })
    @Length(0, 32, { message: '状态不能超过32个字符' })
    @IsEnum(withKeys(enums.CHUNK_WINDOWS_SHEET_STATUS), { message: '状态格式错误' })
    @Column({ nullable: false, comment: withComment('状态', enums.CHUNK_WINDOWS_SHEET_STATUS) })
    status: string

    @ApiProperty({ description: withComment('显示状态', enums.CHUNK_WINDOWS_RESOUREC_CHECK) })
    @IsNotEmpty({ message: '显示状态必填' })
    @Length(0, 32, { message: '显示状态不能超过32个字符' })
    @IsEnum(withKeys(enums.CHUNK_WINDOWS_RESOUREC_CHECK), { message: '显示状态格式错误' })
    @Column({ nullable: false, comment: withComment('显示状态', enums.CHUNK_WINDOWS_RESOUREC_CHECK) })
    check: string
}
