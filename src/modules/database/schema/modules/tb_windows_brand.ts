import { Entity, Column } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, Length } from 'class-validator'
import { DataBaseByAdapter } from '@/modules/database/database.adapter'

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
}
