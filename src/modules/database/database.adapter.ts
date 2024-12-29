import { PrimaryGeneratedColumn, UpdateDateColumn, CreateDateColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
import * as utils from '@/utils/utils-common'

export abstract class DatabaseAdapter {
    @ApiProperty({ description: '主键ID', example: 1000 })
    @IsNotEmpty({ message: '主键ID必填' })
    @PrimaryGeneratedColumn('increment', { comment: '自增长主键' })
    id: number

    @ApiProperty({ description: '创建时间', example: '2023-10-26 16:03:38' })
    @CreateDateColumn({
        name: 'create_time',
        comment: '创建时间',
        update: false,
        transformer: {
            from: value => utils.moment(value).format('YYYY-MM-DD HH:mm:ss'),
            to: value => value
        }
    })
    createTime: Date

    @ApiProperty({ description: '更新时间', example: '2023-10-26 16:03:38' })
    @UpdateDateColumn({
        name: 'modify_time',
        comment: '更新时间',
        transformer: {
            from: value => utils.moment(value).format('YYYY-MM-DD HH:mm:ss'),
            to: value => value
        }
    })
    modifyTime: Date
}
