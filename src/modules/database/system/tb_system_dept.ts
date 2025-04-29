import { Entity, Column } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, Length, IsOptional } from 'class-validator'
import { DatabaseAdapter } from '@/modules/database/database.adapter'

@Entity({ name: 'tb_system_dept', comment: '部门配置表' })
export class SchemaDept extends DatabaseAdapter {
    @ApiProperty({ description: 'ID', example: '2280241553538613248' })
    @IsNotEmpty({ message: 'ID必填' })
    @Column({ name: 'key_id', comment: '唯一ID', length: 19, nullable: false })
    keyId: string

    @ApiProperty({ description: '用户UID', example: '2149446185344106496' })
    @IsNotEmpty({ message: '用户UID必填' })
    @Column({ comment: '用户UID', length: 19, nullable: false })
    uid: string

    @ApiProperty({ description: '部门名称', example: '工作台' })
    @IsNotEmpty({ message: '部门名称必填' })
    @Column({ comment: '部门名称', length: 32, nullable: false })
    name: string

    @ApiProperty({ description: '部门简称', required: false, example: '工作台' })
    @IsOptional()
    @Length(0, 4, { message: '部门简称不能超过4个字符' })
    @Column({ comment: '部门名称', length: 32, nullable: true })
    call: string

    @ApiProperty({ description: '上级部门ID', required: false, example: '2149446185344106496' })
    @IsOptional()
    @Column({ comment: '上级部门ID', length: 19, nullable: true })
    pid: string
}
