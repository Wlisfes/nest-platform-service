import { Entity, Column } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, Length, IsNumber } from 'class-validator'
import { DataBaseByAdapter } from '@/modules/database/database.adapter'
import { Type } from 'class-transformer'

@Entity({ name: 'tb_windows_position', comment: '管理端-部门职位表' })
export class WindowsPosition extends DataBaseByAdapter {
    @ApiProperty({ description: '职位名称', example: '工作台' })
    @IsNotEmpty({ message: '职位名称必填' })
    @Length(0, 32, { message: '职位名称不能超过32个字符' })
    @Column({ comment: '职位名称', length: 32, nullable: false })
    name: string

    @ApiProperty({ description: '排序号', example: 0 })
    @IsNumber({}, { message: '排序号必须为number' })
    @Type(() => Number)
    @Column({ comment: '排序号', default: 0, nullable: false })
    sort: number
}

@Entity({ name: 'tb_windows_position_account', comment: '管理端-职位关联账号表' })
export class WindowsPositionAccount extends DataBaseByAdapter {
    @ApiProperty({ description: '职位ID', example: 1000 })
    @IsNotEmpty({ message: '职位ID必填' })
    @Column({ name: 'post_id', comment: '职位ID', nullable: false })
    postId: number

    @ApiProperty({ description: '账号UID', example: '2149446185344106496' })
    @IsNotEmpty({ message: '账号UID必填' })
    @Column({ comment: '账号UID', length: 19, nullable: false })
    uid: string
}
