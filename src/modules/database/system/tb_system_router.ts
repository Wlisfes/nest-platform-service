import { Entity, Column } from 'typeorm'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, Length, IsEnum } from 'class-validator'
import { Type } from 'class-transformer'
import { IsOptional } from '@/decorator/common.decorator'
import { DatabaseAdapter } from '@/modules/database/database.adapter'
import { comment } from '@/utils/utils-schema'
import { fetchComment } from '@/utils/utils-common'
import * as enums from '@/modules/database/database.enums'

@Entity({ name: 'tb_system_router', comment: '菜单资源配置表' })
export class SchemaRouter extends DatabaseAdapter {
    @ApiProperty({ description: 'ID', example: '2280241553538613248' })
    @IsNotEmpty({ message: 'ID必填' })
    @Column({ name: 'key_id', comment: '唯一ID', length: 19, nullable: false })
    keyId: string

    @ApiProperty({ description: '用户UID', example: '2149446185344106496' })
    @IsNotEmpty({ message: '用户UID必填' })
    @Column({ comment: '用户UID', length: 19, nullable: false })
    uid: string

    @ApiProperty({ description: '权限标识', example: 'base:manager' })
    @IsNotEmpty({ message: '权限标识必填' })
    @Column({ comment: '权限标识', length: 128, nullable: false })
    key: string

    @ApiProperty({ description: '菜单名称', example: '工作台' })
    @IsNotEmpty({ message: '菜单名称必填' })
    @Column({ comment: '菜单名称', length: 32, nullable: false })
    name: string

    @ApiPropertyOptional({ description: '菜单地址', example: '/manager' })
    @IsOptional()
    @Column({ comment: '菜单地址', length: 255, nullable: true })
    router: string

    @ApiPropertyOptional({ description: '菜单图标' })
    @IsOptional()
    @Column({ name: 'icon_name', comment: '菜单图标', length: 64, nullable: true })
    iconName: string

    @ApiPropertyOptional({ description: '上级菜单ID', example: '2149446185344106496' })
    @IsOptional()
    @Column({ comment: '上级菜单ID', length: 19, nullable: true })
    pid: string

    @ApiProperty({ description: '是否可见', example: true })
    @Type(() => Boolean)
    @IsNotEmpty({ message: '是否可见必填' })
    @Column({ comment: '是否可见', default: true, nullable: false })
    check: boolean

    @ApiProperty({ description: '类型', enum: fetchComment(enums.COMMON_SYSTEM_ROUTER_TYPE) })
    @IsNotEmpty({ message: '类型必填' })
    @Length(0, 32, { message: '类型不能超过32个字符' })
    @IsEnum(Object.keys(enums.COMMON_SYSTEM_ROUTER_TYPE), { message: '类型格式错误' })
    @Column({ length: 32, nullable: false, comment: comment('类型', enums.COMMON_SYSTEM_ROUTER_TYPE) })
    type: string

    @ApiProperty({ description: '状态', enum: fetchComment(enums.COMMON_SYSTEM_ROUTER_STATUS) })
    @IsNotEmpty({ message: '状态必填' })
    @Length(0, 32, { message: '状态不能超过32个字符' })
    @IsEnum(Object.keys(enums.COMMON_SYSTEM_ROUTER_STATUS), { message: '状态格式错误' })
    @Column({ nullable: false, comment: comment('状态', enums.COMMON_SYSTEM_ROUTER_STATUS) })
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
