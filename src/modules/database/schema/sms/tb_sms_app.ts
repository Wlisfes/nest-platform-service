import { Entity, Column } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsMobile } from '@/decorator'
import { Type } from 'class-transformer'
import { IsNotEmpty, Length, IsEmail, IsEnum, IsOptional } from 'class-validator'
import { DataBaseAdapter, DataBaseByAdapter, withKeys, withComment } from '@/modules/database/database.adapter'
import * as enums from '@/modules/database/enums'

@Entity({ name: 'tb_sms_app', comment: '客户短信应用表' })
export class TbSmsApp extends DataBaseAdapter {
    @ApiProperty({ description: '客户ID', example: 1008600 })
    @IsNotEmpty({ message: '客户ID必填' })
    @Column({ name: 'client_id', comment: '客户ID', nullable: false })
    clientId: number

    @ApiProperty({ description: '应用ID', example: '09SYfmEt' })
    @IsNotEmpty({ message: '应用ID必填' })
    @Column({ name: 'app_id', comment: '应用ID', nullable: false })
    appId: string

    @ApiProperty({ description: '应用别名', example: 'LYNSK1233001OTP' })
    @IsNotEmpty({ message: '应用别名必填' })
    @Column({ name: 'app_alias', comment: '应用别名', nullable: false })
    appAlias: string

    @ApiProperty({
        description: withComment('状态', enums.CHUNK_CLIENT_SMS_STATUS),
        example: enums.CHUNK_CLIENT_SMS_STATUS.inactive.value
    })
    @IsNotEmpty({ message: '状态必填' })
    @IsEnum(withKeys(enums.CHUNK_CLIENT_SMS_STATUS), { message: '状态格式错误' })
    @Column({ nullable: false, comment: withComment('状态', enums.CHUNK_CLIENT_SMS_STATUS) })
    status: string

    @ApiProperty({
        description: withComment('类型', enums.CHUNK_CLIENT_SMS_TYPE),
        example: enums.CHUNK_CLIENT_SMS_TYPE.otp.value
    })
    @IsNotEmpty({ message: '类型必填' })
    @IsEnum(withKeys(enums.CHUNK_CLIENT_SMS_TYPE), { message: '类型格式错误' })
    @Column({ nullable: false, comment: withComment('类型', enums.CHUNK_CLIENT_SMS_TYPE) })
    type: string

    @ApiProperty({ required: false, description: '报告推送地址' })
    @IsOptional()
    @Length(0, 1024, { message: '报告推送地址长度不能超过1024位' })
    @Column({ name: 'push_url', comment: '报告推送地址', length: 1024, nullable: true })
    pushUrl: string

    @ApiProperty({ required: false, description: '备注' })
    @IsOptional()
    @Length(0, 1024, { message: '备注长度不能超过1024位' })
    @Column({ comment: '备注', length: 1024, nullable: true })
    remark: string
}
