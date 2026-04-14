import { Entity, Column } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, Length, IsEmail } from 'class-validator'
import { DataBaseAdapter } from '@/modules/database/database.adapter'

@Entity({ name: 'tb_windows_client', comment: '管理端-客户表' })
export class WindowsClient extends DataBaseAdapter {
    @ApiProperty({ description: '客户编码', example: 'C10001' })
    @IsNotEmpty({ message: '客户编码必填' })
    @Length(1, 32, { message: '客户编码长度1~32位' })
    @Column({ comment: '客户编码', length: 32, nullable: false })
    code: string

    @ApiProperty({ description: '客户名称', example: '测试客户' })
    @IsNotEmpty({ message: '客户名称必填' })
    @Length(1, 64, { message: '客户名称长度1~64位' })
    @Column({ comment: '客户名称', length: 64, nullable: false })
    name: string

    @ApiProperty({ description: '归属品牌ID', example: 1000 })
    @IsNotEmpty({ message: '归属品牌ID必填' })
    @Column({ name: 'dept_id', comment: '归属品牌ID', nullable: false })
    brandId: number

    @ApiProperty({ description: '邮箱', example: 'client@example.com' })
    @IsNotEmpty({ message: '邮箱必填' })
    @IsEmail({}, { message: '邮箱格式错误' })
    @Column({ comment: '邮箱', length: 128, nullable: true })
    email: string
}
