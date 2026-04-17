import { Entity, Column } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, Length, IsEnum } from 'class-validator'
import { DataBaseByAdapter, withKeys, withComment } from '@/modules/database/database.adapter'
import * as enums from '@/modules/database/enums'

@Entity({ name: 'tb_windows_brand', comment: '管理端-品牌表' })
export class WindowsBrand extends DataBaseByAdapter {
    @ApiProperty({ description: '品牌名称', example: 'LYNKS' })
    @IsNotEmpty({ message: '品牌名称必填' })
    @Length(1, 64, { message: '品牌名称长度1~64位' })
    @Column({ comment: '品牌名称', length: 64, nullable: false })
    name: string

    @ApiProperty({ description: '品牌基本描述', example: 'LYNKS' })
    @IsNotEmpty({ message: '品牌基本描述必填' })
    @Length(1, 1024, { message: '品牌基本描述长度1~1024位' })
    @Column({ comment: '品牌基本描述', length: 1024, nullable: false })
    document: string

    @ApiProperty({
        description: withComment('状态', enums.CHUNK_SHEET_STATUS),
        example: enums.CHUNK_SHEET_STATUS.enable.value
    })
    @IsNotEmpty({ message: '状态必填' })
    @Length(0, 32, { message: '状态不能超过32个字符' })
    @IsEnum(withKeys(enums.CHUNK_SHEET_STATUS), { message: '状态格式错误' })
    @Column({ nullable: false, comment: withComment('状态', enums.CHUNK_SHEET_STATUS) })
    status: string
}
