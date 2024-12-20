import { Entity, Column } from 'typeorm'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsNotEmpty, IsEnum, IsNumber } from 'class-validator'
import { IsOptional } from '@/decorator/common.decorator'
import { CommonEntier } from '@/utils/utils-typeorm'
import * as enums from '@/enums/instance'

@Entity({ name: 'tb_router', comment: '路由菜单表' })
export class tbRouter extends CommonEntier {
    @ApiProperty({ description: '菜单名称', example: '控制台' })
    @IsNotEmpty({ message: '菜单名称必填' })
    @Column({ comment: '菜单名称', length: 32, nullable: false })
    name: string

    @ApiPropertyOptional({ description: '菜单路径' })
    @IsOptional()
    @Column({ comment: '唯一标识', nullable: true })
    path: string

    @ApiProperty({ description: '唯一标识' })
    @IsNotEmpty({ message: '唯一标识必填' })
    @Column({ comment: '唯一标识', nullable: false })
    instance: string

    @ApiPropertyOptional({ description: '菜单图标' })
    @IsOptional()
    @Column({ comment: '菜单图标', length: 32, nullable: true })
    icon: string

    @ApiPropertyOptional({ description: '上级菜单ID', example: '858619496' })
    @IsOptional()
    @Column({ comment: '上级菜单ID', length: 32, nullable: true })
    pid: string

    @ApiProperty({ description: '菜单是否可见', example: true })
    @IsNotEmpty({ message: '菜单是否可见必填' })
    @Column({ comment: '菜单是否可见', default: true, nullable: false })
    show: boolean

    @ApiProperty({ description: '版本号', example: 'v1.0.0' })
    @IsNotEmpty({ message: '版本号必填' })
    @Column({ comment: '版本号', default: 'v1.0.0', nullable: false })
    version: string

    @ApiPropertyOptional({ description: '激活路由' })
    @IsOptional()
    @Column({ comment: '激活路由', nullable: true })
    active: string

    @ApiProperty({ description: '菜单排序' })
    @IsNumber({}, { message: '菜单排序必须为number' })
    @Type(() => Number)
    @Column({ comment: '菜单排序', default: 0, nullable: false })
    sort: number

    @ApiProperty({ description: '菜单状态: 启用-enable、禁用-disable', enum: enums.RouterState })
    @IsNotEmpty({ message: '菜单状态必填' })
    @IsEnum(enums.RouterState, { message: '菜单状态参数格式错误' })
    @Column({ comment: '菜单状态: 启用-enable、禁用-disable', default: enums.RouterState.enable, nullable: false })
    state: string

    @ApiProperty({ description: '菜单类型: 启用-router、禁用-button', enum: enums.RouterType })
    @IsNotEmpty({ message: '菜单类型必填' })
    @IsEnum(enums.RouterType, { message: '菜单类型参数格式错误' })
    @Column({ comment: '菜单类型: 启用-router、禁用-button', default: enums.RouterType.router, nullable: false })
    type: string

    @ApiProperty({ description: '员工ID', example: '2149446185344106496' })
    @IsNotEmpty({ message: 'staffId必填' })
    @Column({ comment: '员工ID', length: 32, nullable: false })
    staffId: string
}
