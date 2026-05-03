import { Entity, Column, Unique } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, Length, IsEnum } from 'class-validator'
import { DataBaseAdapter, withKeys, withComment } from '@/modules/database/database.adapter'
import * as enums from '@/modules/database/enums'

@Entity({ name: 'tb_windows_currency', comment: '管理端-币种表' })
export class WindowsCurrency extends DataBaseAdapter {
    @ApiProperty({ description: '币种编码', example: 'USD' })
    @IsNotEmpty({ message: '币种编码必填' })
    @Length(1, 16, { message: '币种编码长度1~16位' })
    @Column({ comment: '币种编码', length: 16, nullable: false })
    currency: string

    @ApiProperty({ description: '币种名称', example: '美元' })
    @IsNotEmpty({ message: '币种名称必填' })
    @Length(1, 64, { message: '币种名称长度1~64位' })
    @Column({ comment: '币种名称', length: 64, nullable: false })
    name: string

    @ApiProperty({ description: '币种符号', example: '$' })
    @IsNotEmpty({ message: '币种符号必填' })
    @Length(1, 8, { message: '币种符号长度1~8位' })
    @Column({ comment: '币种符号', length: 8, nullable: false })
    symbol: string

    @ApiProperty({
        description: withComment('状态', enums.CHUNK_CURRENCY_STATUS),
        example: enums.CHUNK_CURRENCY_STATUS.enable.value
    })
    @IsNotEmpty({ message: '状态必填' })
    @Length(0, 32, { message: '状态不能超过32个字符' })
    @IsEnum(withKeys(enums.CHUNK_CURRENCY_STATUS), { message: '状态格式错误' })
    @Column({ nullable: false, comment: withComment('状态', enums.CHUNK_CURRENCY_STATUS) })
    status: string
}

@Entity({ name: 'tb_windows_currency_exchange', comment: '管理端-币种汇率表' })
@Unique('uk_currency_exchange_date', ['currency', 'date'])
export class WindowsCurrencyExchange extends DataBaseAdapter {
    @ApiProperty({ description: '币种编码', example: 'CNY' })
    @IsNotEmpty({ message: '币种编码必填' })
    @Length(1, 16, { message: '币种编码长度1~16位' })
    @Column({ comment: '币种编码', length: 16, nullable: false })
    currency: string

    @ApiProperty({ description: '汇率（基于USD）', example: 7.2534 })
    @IsNotEmpty({ message: '汇率必填' })
    @Column({ comment: '汇率（基于USD）', type: 'decimal', precision: 16, scale: 6, nullable: false })
    rate: number

    @ApiProperty({ description: '汇率日期', example: '2025-05-03' })
    @IsNotEmpty({ message: '汇率日期必填' })
    @Column({ name: 'date', comment: '汇率日期', type: 'date', nullable: false })
    date: string
}
