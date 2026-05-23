import { Entity, Column } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, Length, IsEnum, IsOptional } from 'class-validator'
import { DataBaseByAdapter, DateWithColumn, withKeys, withComment } from '@/modules/database/database.adapter'
import * as enums from '@/modules/database/enums'

@Entity({ name: 'tb_sms_app_formosan', comment: '客户短信应用报价表' })
export class TbSmsAppFormosan extends DataBaseByAdapter {
    @ApiProperty({ description: '客户ID', example: 1008600 })
    @IsNotEmpty({ message: '客户ID必填' })
    @Column({ name: 'client_id', comment: '客户ID', nullable: false })
    clientId: number

    @ApiProperty({ description: '应用ID', example: '09SYfmEt' })
    @IsNotEmpty({ message: '应用ID必填' })
    @Column({ name: 'app_id', comment: '应用ID', nullable: false })
    appId: string

    @ApiProperty({ description: '国家/地区编码', example: '86' })
    @IsNotEmpty({ message: '国家/地区编码必填' })
    @Column({ comment: '国家/地区编码', length: 10, nullable: false })
    code: string

    @ApiProperty({ description: '移动国家代码', example: '460' })
    @IsNotEmpty({ message: '移动国家代码必填' })
    @Column({ comment: '移动国家代码', length: 4, nullable: false })
    mcc: string

    @ApiProperty({ description: '上行短信售价USD（放大百万倍存储）', example: 0 })
    @Column({ type: 'bigint', name: 'up_usd', comment: '上行短信售价USD（放大百万倍存储）', nullable: false, default: 0 })
    upUsd: number

    @ApiProperty({ description: '下行短信售价USD（放大百万倍存储）', example: 0 })
    @Column({ type: 'bigint', name: 'down_usd', comment: '下行短信售价USD（放大百万倍存储）', nullable: false, default: 0 })
    downUsd: number

    @ApiProperty({ description: '生效时间', example: '2025-01-01 00:00:00' })
    @IsNotEmpty({ message: '生效时间必填' })
    @DateWithColumn(Column, { name: 'effective_time', comment: '生效时间', type: 'datetime', nullable: false })
    effectiveTime: Date

    @ApiProperty({ required: false, description: '失效时间（NULL表示永久有效）', example: '2025-12-31 23:59:59' })
    @IsOptional()
    @DateWithColumn(Column, { name: 'expiry_time', comment: '失效时间', type: 'datetime', nullable: true })
    expiryTime: Date

    @ApiProperty({
        description: withComment('状态', enums.CHUNK_CLIENT_STATUS),
        example: enums.CHUNK_CLIENT_STATUS.enable.value
    })
    @IsNotEmpty({ message: '状态必填' })
    @IsEnum(withKeys(enums.CHUNK_CLIENT_STATUS), { message: '状态格式错误' })
    @Column({ nullable: false, comment: withComment('状态', enums.CHUNK_CLIENT_STATUS) })
    status: string

    @ApiProperty({ required: false, description: '备注' })
    @IsOptional()
    @Length(0, 1024, { message: '备注长度不能超过1024位' })
    @Column({ comment: '备注', length: 1024, nullable: true })
    remark: string
}

@Entity({ name: 'tb_sms_app_formosan_draft', comment: '客户短信应用报价草稿表' })
export class TbSmsAppFormosanDraft extends DataBaseByAdapter {
    @ApiProperty({ description: '客户ID', example: 1008600 })
    @IsNotEmpty({ message: '客户ID必填' })
    @Column({ name: 'client_id', comment: '客户ID', nullable: false })
    clientId: number

    @ApiProperty({ description: '应用ID', example: '09SYfmEt' })
    @IsNotEmpty({ message: '应用ID必填' })
    @Column({ name: 'app_id', comment: '应用ID', nullable: false })
    appId: string

    @ApiProperty({ description: '国家/地区编码', example: '86' })
    @IsNotEmpty({ message: '国家/地区编码必填' })
    @Column({ comment: '国家/地区编码', length: 10, nullable: false })
    code: string

    @ApiProperty({ description: '移动国家代码', example: '460' })
    @IsNotEmpty({ message: '移动国家代码必填' })
    @Column({ comment: '移动国家代码', length: 4, nullable: false })
    mcc: string

    @ApiProperty({ description: '上行短信售价USD（放大百万倍存储）', example: 0 })
    @Column({ type: 'bigint', name: 'up_usd', comment: '上行短信售价USD（放大百万倍存储）', nullable: false, default: 0 })
    upUsd: number

    @ApiProperty({ description: '下行短信售价USD（放大百万倍存储）', example: 0 })
    @Column({ type: 'bigint', name: 'down_usd', comment: '下行短信售价USD（放大百万倍存储）', nullable: false, default: 0 })
    downUsd: number

    @ApiProperty({ required: false, description: '生效时间', example: '2025-01-01 00:00:00' })
    @IsOptional()
    @DateWithColumn(Column, { name: 'effective_time', comment: '生效时间', type: 'datetime', nullable: true })
    effectiveTime: Date

    @ApiProperty({ required: false, description: '失效时间（NULL表示永久有效）', example: '2025-12-31 23:59:59' })
    @IsOptional()
    @DateWithColumn(Column, { name: 'expiry_time', comment: '失效时间', type: 'datetime', nullable: true })
    expiryTime: Date

    @ApiProperty({
        description: withComment('报价来源', enums.CHUNK_SMS_FORMOSAN_SOURCE),
        example: enums.CHUNK_SMS_FORMOSAN_SOURCE.addition.value
    })
    @IsNotEmpty({ message: '报价来源必填' })
    @IsEnum(withKeys(enums.CHUNK_SMS_FORMOSAN_SOURCE), { message: '报价来源格式错误' })
    @Column({ nullable: false, comment: withComment('报价来源', enums.CHUNK_SMS_FORMOSAN_SOURCE) })
    source: string

    @ApiProperty({ required: false, description: '关联原报价表主键ID', example: 1000 })
    @IsOptional()
    @Column({ name: 'formosan_id', comment: '关联原报价表主键ID', nullable: true })
    formosanId: number

    @ApiProperty({
        description: withComment('状态', enums.CHUNK_CLIENT_STATUS),
        example: enums.CHUNK_CLIENT_STATUS.enable.value
    })
    @IsNotEmpty({ message: '状态必填' })
    @IsEnum(withKeys(enums.CHUNK_CLIENT_STATUS), { message: '状态格式错误' })
    @Column({ nullable: false, comment: withComment('状态', enums.CHUNK_CLIENT_STATUS) })
    status: string

    @ApiProperty({ required: false, description: '备注' })
    @IsOptional()
    @Length(0, 1024, { message: '备注长度不能超过1024位' })
    @Column({ comment: '备注', length: 1024, nullable: true })
    remark: string
}
