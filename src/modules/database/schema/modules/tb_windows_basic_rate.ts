import { Entity, Column } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional } from 'class-validator'
import { DataBaseByAdapter } from '@/modules/database/database.adapter'

@Entity({ name: 'tb_windows_basic_sms_rate', comment: '管理端-短信基础价格表' })
export class WindowsBasicSmsRate extends DataBaseByAdapter {
    @ApiProperty({ description: '国家/地区编码', example: '86' })
    @IsNotEmpty({ message: '国家/地区编码必填' })
    @Column({ comment: '国家/地区编码', length: 10, nullable: false })
    code: string

    @ApiProperty({ description: '移动国家代码', example: '460' })
    @IsNotEmpty({ message: '移动国家代码必填' })
    @Column({ comment: '移动国家代码', length: 4, nullable: false })
    mcc: string

    @ApiProperty({ description: '上行短信价格（放大百万倍存储）', example: 1008600 })
    @IsNotEmpty({ message: '上行短信价格必填' })
    @Column({ name: 'up_usd', comment: '上行短信价格（放大百万倍存储）', nullable: false })
    upUsd: number

    @ApiProperty({ description: '下行短信价格（放大百万倍存储）', example: 1008600 })
    @IsNotEmpty({ message: '下行短信价格必填' })
    @Column({ name: 'down_usd', comment: '下行短信价格（放大百万倍存储）', nullable: false })
    downUsd: number

    @ApiProperty({ description: '状态（enable/disable）', example: 'enable' })
    @IsOptional()
    @Column({ comment: '状态', length: 16, default: 'enable' })
    status: string

    @ApiProperty({ description: '备注', example: '备注信息' })
    @IsOptional()
    @Column({ comment: '备注', length: 1024, nullable: true })
    remark: string
}
