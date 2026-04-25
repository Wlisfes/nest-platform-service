import { Entity, Column } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsMobile } from '@/decorator'
import { IsNotEmpty, Length, IsEmail, IsEnum, IsOptional } from 'class-validator'
import { DataBaseAdapter, DataBaseByAdapter, withKeys, withComment } from '@/modules/database/database.adapter'
import * as enums from '@/modules/database/enums'

@Entity({ name: 'tb_windows_client', comment: '管理端-C端客户表' })
export class WindowsClient extends DataBaseAdapter {
    @ApiProperty({ description: '归属人ID', example: '2149446185344106496' })
    @IsNotEmpty({ message: '归属人ID必填' })
    @Column({ comment: '归属人ID', length: 19, nullable: false })
    userId: string

    @ApiProperty({ description: '客户名称', example: '测试客户' })
    @IsNotEmpty({ message: '客户名称必填' })
    @Length(1, 64, { message: '客户名称长度1~64位' })
    @Column({ comment: '客户名称', length: 64, nullable: false })
    name: string

    @ApiProperty({ description: '客户别名', example: 'Test Client' })
    @IsOptional()
    @Length(0, 64, { message: '客户别名长度不能超过64位' })
    @Column({ comment: '客户别名', length: 64, nullable: true })
    alias: string

    @ApiProperty({ description: '归属品牌ID', example: 1000 })
    @IsNotEmpty({ message: '归属品牌ID必填' })
    @Column({ name: 'dept_id', comment: '归属品牌ID', nullable: false })
    brandId: number

    @ApiProperty({ description: '币种编码', example: 'USD' })
    @IsNotEmpty({ message: '币种编码必填' })
    @Length(1, 16, { message: '币种编码长度1~16位' })
    @Column({ comment: '币种编码', length: 16, nullable: false })
    currency: string

    @ApiProperty({ description: '邮箱', example: 'client@example.com' })
    @IsNotEmpty({ message: '邮箱必填' })
    @IsEmail({}, { message: '邮箱格式错误' })
    @Column({ comment: '邮箱', length: 128, nullable: false })
    email: string

    @ApiProperty({ description: '电话号码', example: '18888888888' })
    @IsMobile({ message: '电话号码格式错误' })
    @Column({ comment: '电话号码', length: 32, nullable: true })
    phone: string

    @ApiProperty({
        description: withComment('状态', enums.CHUNK_CLIENT_STATUS),
        example: enums.CHUNK_CLIENT_STATUS.enable.value
    })
    @IsNotEmpty({ message: '状态必填' })
    @IsEnum(withKeys(enums.CHUNK_CLIENT_STATUS), { message: '状态格式错误' })
    @Column({ nullable: false, comment: withComment('状态', enums.CHUNK_CLIENT_STATUS) })
    status: string

    @ApiProperty({
        description: withComment('付款模式', enums.CHUNK_CLIENT_PAY_MODE),
        example: enums.CHUNK_CLIENT_PAY_MODE.prepaid.value
    })
    @IsNotEmpty({ message: '付款模式必填' })
    @IsEnum(withKeys(enums.CHUNK_CLIENT_PAY_MODE), { message: '付款模式格式错误' })
    @Column({ name: 'pay_mode', nullable: false, comment: withComment('付款模式', enums.CHUNK_CLIENT_PAY_MODE) })
    payMode: string

    @ApiProperty({ description: withComment('客户类型', enums.CHUNK_CLIENT_CLASS), example: enums.CHUNK_CLIENT_CLASS.common.value })
    @IsNotEmpty({ message: '客户类型必填' })
    @IsEnum(withKeys(enums.CHUNK_CLIENT_CLASS), { message: '客户类型格式错误' })
    @Column({ name: 'class_type', nullable: false, comment: withComment('客户类型', enums.CHUNK_CLIENT_CLASS) })
    classType: string

    @ApiProperty({ description: '余额（放大百万倍存储）', example: 0 })
    @Column({ type: 'bigint', comment: '余额（放大百万倍存储）', nullable: false, default: 0 })
    balance: number

    @ApiProperty({ description: '信用额度（放大百万倍存储）', example: 0 })
    @Column({ type: 'bigint', name: 'credit', comment: '信用额度（放大百万倍存储）', nullable: false, default: 0 })
    credit: number

    @ApiProperty({ description: '等级', example: 1 })
    @Column({ comment: '等级', type: 'int', default: 1, nullable: false })
    level: number

    @ApiProperty({ description: withComment('阶段', enums.CHUNK_CLIENT_STAGE), example: enums.CHUNK_CLIENT_STAGE.cluetrail.value })
    @IsNotEmpty({ message: '阶段必填' })
    @IsEnum(withKeys(enums.CHUNK_CLIENT_STAGE), { message: '阶段格式错误' })
    @Column({ name: 'stage', nullable: false, comment: withComment('阶段', enums.CHUNK_CLIENT_STAGE) })
    stage: string

    @ApiProperty({
        description: withComment('认证状态', enums.CHUNK_CLIENT_AUTH_STATUS),
        example: enums.CHUNK_CLIENT_AUTH_STATUS.unverified.value
    })
    @IsNotEmpty({ message: '认证状态必填' })
    @IsEnum(withKeys(enums.CHUNK_CLIENT_AUTH_STATUS), { message: '认证状态格式错误' })
    @Column({ name: 'auth_status', nullable: false, comment: withComment('认证状态', enums.CHUNK_CLIENT_AUTH_STATUS) })
    authStatus: string

    @ApiProperty({ description: withComment('注册来源', enums.CHUNK_CLIENT_SOURCE), example: enums.CHUNK_CLIENT_SOURCE.manual.value })
    @IsNotEmpty({ message: '注册来源必填' })
    @IsEnum(withKeys(enums.CHUNK_CLIENT_SOURCE), { message: '注册来源格式错误' })
    @Column({ nullable: false, comment: withComment('注册来源', enums.CHUNK_CLIENT_SOURCE) })
    source: string

    @ApiProperty({ description: '备注', example: '' })
    @IsOptional()
    @Length(0, 1024, { message: '备注长度不能超过1024位' })
    @Column({ comment: '备注', length: 1024, nullable: true })
    remark: string
}

@Entity({ name: 'tb_windows_client_tags', comment: '管理端-C端客户标签表' })
export class WindowsClientTags extends DataBaseByAdapter {
    @ApiProperty({ description: '客户ID', example: 1000 })
    @IsNotEmpty({ message: '客户ID必填' })
    @Column({ name: 'client_id', comment: '客户ID', nullable: false })
    clientId: number

    @ApiProperty({ description: '标签名称', example: 'VIP' })
    @IsNotEmpty({ message: '标签名称必填' })
    @Length(0, 64, { message: '标签名称长度不能超过64位' })
    @Column({ name: 'tag_name', comment: '标签名称', nullable: false })
    tagName: string
}

@Entity({ name: 'tb_windows_client_share', comment: '管理端-C端客户共享表' })
export class WindowsClientShare extends DataBaseByAdapter {
    @ApiProperty({ description: '客户ID', example: 1000 })
    @IsNotEmpty({ message: '客户ID必填' })
    @Column({ name: 'client_id', comment: '客户ID', nullable: false })
    clientId: number

    @ApiProperty({ description: '共享人ID', example: '2149446185344106496' })
    @IsNotEmpty({ message: '共享人ID必填' })
    @Column({ comment: '共享人ID', length: 19, nullable: false })
    userId: string
}

@Entity({ name: 'tb_windows_client_sms_app', comment: '管理端-C端客户短信应用表' })
export class WindowsClientSmsApp extends DataBaseByAdapter {
    @ApiProperty({ description: '客户ID', example: 1000 })
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
