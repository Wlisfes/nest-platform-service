import { Entity, Column } from 'typeorm'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsEnum } from 'class-validator'
import { Type } from 'class-transformer'
import { IsOptional } from '@/decorator/common.decorator'
import { DatabaseAdapter } from '@/modules/database/database.adapter'
import * as enums from '@/modules/database/database.enums'

@Entity({ name: 'tb_system', comment: '系统配置表' })
export class SchemaSystem extends DatabaseAdapter {
    @ApiProperty({ description: '用户UID', example: '2149446185344106496' })
    @IsNotEmpty({ message: '用户UID必填' })
    @Column({ comment: '用户UID', length: 19, nullable: false })
    uid: string

    @ApiProperty({ description: 'VID', example: '2149446185344106496' })
    @IsNotEmpty({ message: 'VID必填' })
    @Column({ comment: '唯一ID', length: 19, nullable: false })
    vid: string

    @ApiProperty({ description: '权限标识' })
    @IsNotEmpty({ message: '权限标识必填' })
    @Column({ comment: '权限标识', length: 128, nullable: false })
    key: string

    @ApiProperty({ description: '菜单名称', example: '控制台' })
    @IsNotEmpty({ message: '菜单名称必填' })
    @Column({ comment: '菜单名称', length: 32, nullable: false })
    name: string

    @ApiPropertyOptional({ description: '菜单地址' })
    @IsOptional()
    @Column({ comment: '菜单地址', length: 255, nullable: true })
    router: string

    @ApiPropertyOptional({ description: '菜单图标' })
    @IsOptional()
    @Column({ comment: '菜单图标', length: 64, nullable: true })
    icon: string

    @ApiProperty({ description: '上级菜单ID', example: '2149446185344106496' })
    @IsOptional()
    @Column({ comment: '上级菜单ID', length: 19, nullable: true })
    pid: string

    @ApiProperty({ description: '是否可见', example: false })
    @IsNotEmpty({ message: '是否可见必填' })
    @Column({ comment: '是否可见', default: true, nullable: false })
    check: boolean

    @ApiProperty({ description: '类型: 菜单-router、按钮-button', enum: enums.SchemaSystem_Source })
    @IsNotEmpty({ message: '类型必填' })
    @IsEnum(enums.SchemaSystem_Source, { message: '类型参数格式错误' })
    @Column({ comment: '类型: 菜单-router、按钮-button', length: 64, default: enums.SchemaSystem_Source.router, nullable: false })
    source: string

    @ApiProperty({ description: '状态: 禁用-disable、启用-enable', enum: enums.SchemaSystem_Status })
    @IsNotEmpty({ message: '状态必填' })
    @IsEnum(enums.SchemaSystem_Status, { message: '状态参数格式错误' })
    @Column({ comment: '状态: 禁用-disable、启用-enable', default: enums.SchemaSystem_Status.enable, nullable: false })
    status: string

    @ApiProperty({ description: '版本号', example: 'v1.0.0' })
    @IsNotEmpty({ message: '版本号必填' })
    @Column({ comment: '版本号', length: 32, default: 'v1.0.0', nullable: false })
    version: string

    @ApiPropertyOptional({ description: '激活路由' })
    @IsOptional()
    @Column({ comment: '激活路由', nullable: true })
    active: string

    @ApiProperty({ description: '排序号', example: 0 })
    @IsNumber({}, { message: '排序号必须为number' })
    @Type(() => Number)
    @Column({ comment: '排序号', default: 0, nullable: false })
    sort: number
}
