import { Entity, Column } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'
import { DatabaseAdapter } from '@/modules/database/database.adapter'

@Entity({ name: 'tb_system_field', comment: '表头字段配置表' })
export class SchemaField extends DatabaseAdapter {
    @ApiProperty({ description: '字段名称', example: 'name' })
    @IsNotEmpty({ message: '字段名称必填' })
    @Column({ comment: '字段名称', length: 32, nullable: false })
    field: string

    @ApiProperty({ description: '字段描述', example: '菜单名称' })
    @IsNotEmpty({ message: '字段描述必填' })
    @Column({ comment: '字段描述', length: 32, nullable: false })
    name: string

    @ApiProperty({ description: '是否可见', example: true })
    @Type(() => Boolean)
    @IsNotEmpty({ message: '是否可见必填' })
    @Column({ comment: '是否可见', default: true, nullable: false })
    checked: boolean
}
