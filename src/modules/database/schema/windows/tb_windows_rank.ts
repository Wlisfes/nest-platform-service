import { Entity, Column } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, Length, IsNumber, IsEnum, IsOptional } from 'class-validator'
import { DataBaseByAdapter, DataBaseAdapter, withKeys, withComment } from '@/modules/database/database.adapter'
import { Type } from 'class-transformer'
import * as enums from '@/modules/database/enums'

@Entity({ name: 'tb_windows_rank', comment: '管理端-职级表' })
export class WindowsRank extends DataBaseByAdapter {
    @ApiProperty({ description: '职级名称', example: 'P1' })
    @IsNotEmpty({ message: '职级名称必填' })
    @Length(0, 32, { message: '职级名称不能超过32个字符' })
    @Column({ comment: '职级名称', length: 32, nullable: false })
    name: string

    @ApiProperty({
        description: withComment('职级类型', enums.CHUNK_WINDOWS_RANK_TYPE),
        example: enums.CHUNK_WINDOWS_RANK_TYPE.professional.value
    })
    @IsNotEmpty({ message: '职级类型必填' })
    @IsEnum(withKeys(enums.CHUNK_WINDOWS_RANK_TYPE), { message: '职级类型格式错误' })
    @Column({ nullable: false, comment: withComment('职级类型', enums.CHUNK_WINDOWS_RANK_TYPE) })
    chunk: string

    @ApiProperty({ description: '排序号', example: 0 })
    @IsNumber({}, { message: '排序号必须为number' })
    @Type(() => Number)
    @Column({ comment: '排序号', default: 0, nullable: false })
    sort: number
}

@Entity({ name: 'tb_windows_rank_account', comment: '管理端-职级关联账号表' })
export class WindowsRankAccount extends DataBaseAdapter {
    @ApiProperty({ description: '职级ID', example: 1000 })
    @IsNotEmpty({ message: '职级ID必填' })
    @Column({ name: 'rank_id', comment: '职级ID', nullable: false })
    rankId: number

    @ApiProperty({ description: '账号UID', example: '2149446185344106496' })
    @IsNotEmpty({ message: '账号UID必填' })
    @Column({ comment: '账号UID', length: 19, nullable: false })
    uid: string
}
