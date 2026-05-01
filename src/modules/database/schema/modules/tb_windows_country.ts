import { Entity, Column } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, Length, IsEnum } from 'class-validator'
import { DataBaseAdapter, withKeys, withComment } from '@/modules/database/database.adapter'
import * as enums from '@/modules/database/enums'

@Entity({ name: 'tb_windows_country', comment: '管理端-国家/地区表' })
export class WindowsCountry extends DataBaseAdapter {
    @ApiProperty({ description: '国家/地区编码', example: '86' })
    @IsNotEmpty({ message: '国家/地区编码必填' })
    @Column({ comment: '国家/地区编码', length: 10, nullable: false })
    code: string

    @ApiProperty({ description: '移动国家代码', example: '460' })
    @IsNotEmpty({ message: '移动国家代码必填' })
    @Column({ comment: '移动国家代码', length: 4, nullable: false })
    mcc: string

    @ApiProperty({ description: '国家/地区名称中文', example: '中国' })
    @IsNotEmpty({ message: '国家/地区名称中文必填' })
    @Length(1, 64, { message: '国家/地区名称中文长度1~64位' })
    @Column({ name: 'cn_name', comment: '国家/地区名称中文', length: 64, nullable: false })
    cnName: string

    @ApiProperty({ description: '国家/地区名称英文', example: 'China' })
    @IsNotEmpty({ message: '国家/地区名称英文必填' })
    @Length(1, 64, { message: '国家/地区名称英文长度1~64位' })
    @Column({ name: 'en_name', comment: '国家/地区名称英文', length: 64, nullable: false })
    enName: string

    @ApiProperty({ description: withComment('状态', enums.CHUNK_COUNTRY_STATUS), example: enums.CHUNK_COUNTRY_STATUS.enable.value })
    @IsNotEmpty({ message: '状态必填' })
    @IsEnum(withKeys(enums.CHUNK_COUNTRY_STATUS), { message: '状态格式错误' })
    @Column({ nullable: false, comment: withComment('状态', enums.CHUNK_COUNTRY_STATUS) })
    status: string
}
