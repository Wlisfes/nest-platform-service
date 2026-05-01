import { Entity, Column } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, Length, IsEnum, IsOptional, Min } from 'class-validator'
import { DataBaseAdapter, withKeys, withComment } from '@/modules/database/database.adapter'
import * as enums from '@/modules/database/enums'

@Entity({ name: 'tb_windows_wallet_consume', comment: '管理端-钱包消费表' })
export class WindowsWalletConsume extends DataBaseAdapter {
    @ApiProperty({ description: '客户ID', example: 1000 })
    @IsNotEmpty({ message: '客户ID必填' })
    @Column({ name: 'client_id', comment: '客户ID', nullable: false })
    clientId: number

    @ApiProperty({ description: '任务ID', example: 1000 })
    @IsOptional()
    @Column({ name: 'task_id', comment: '任务ID', nullable: true })
    taskId: number

    @ApiProperty({
        description: withComment('变动类型', enums.WINDOWS_WALLET_CHANGE_TYPE),
        example: enums.WINDOWS_WALLET_CHANGE_TYPE.sms.value
    })
    @IsNotEmpty({ message: '变动类型必填' })
    @IsEnum(withKeys(enums.WINDOWS_WALLET_CHANGE_TYPE), { message: '变动类型格式错误' })
    @Column({ name: 'change_type', nullable: false, comment: withComment('变动类型', enums.WINDOWS_WALLET_CHANGE_TYPE) })
    changeType: string

    @ApiProperty({
        description: withComment('交易类型', enums.WINDOWS_WALLET_BILL_TYPE),
        example: enums.WINDOWS_WALLET_BILL_TYPE.deduct.value
    })
    @IsNotEmpty({ message: '交易类型必填' })
    @IsEnum(withKeys(enums.WINDOWS_WALLET_BILL_TYPE), { message: '交易类型格式错误' })
    @Column({ name: 'bill_type', nullable: false, comment: withComment('交易类型', enums.WINDOWS_WALLET_BILL_TYPE) })
    billType: string

    @ApiProperty({ description: '变动金额（绝对值，放大百万倍存储）', example: 1000000 })
    @IsNotEmpty({ message: '变动金额必填' })
    @Min(0, { message: '变动金额必须大于等于0' })
    @Column({ type: 'bigint', comment: '变动金额（绝对值，放大百万倍存储）', nullable: false, default: 0 })
    amount: number

    @ApiProperty({ description: '变动前余额（放大百万倍存储）', example: 0 })
    @Column({ type: 'bigint', name: 'before_balance', comment: '变动前余额（放大百万倍存储）', nullable: false, default: 0 })
    beforeBalance: number

    @ApiProperty({ description: '变动后余额（放大百万倍存储）', example: 0 })
    @Column({ type: 'bigint', name: 'after_balance', comment: '变动后余额（放大百万倍存储）', nullable: false, default: 0 })
    afterBalance: number

    @ApiProperty({ description: '备注', example: '业务批量扣费' })
    @IsOptional()
    @Length(0, 1024, { message: '备注长度不能超过1024位' })
    @Column({ comment: '备注', length: 1024, nullable: true })
    remark: string
}

@Entity({ name: 'tb_windows_wallet_recharge', comment: '管理端-钱包充值表' })
export class WindowsWalletRecharge extends DataBaseAdapter {
    @ApiProperty({ description: '客户ID', example: 1000 })
    @IsNotEmpty({ message: '客户ID必填' })
    @Column({ name: 'client_id', comment: '客户ID', nullable: false })
    clientId: number

    @ApiProperty({
        description: withComment('充值类型', enums.WINDOWS_WALLET_RECHARGE_TYPE),
        example: enums.WINDOWS_WALLET_RECHARGE_TYPE.system.value
    })
    @IsNotEmpty({ message: '充值类型必填' })
    @IsEnum(withKeys(enums.WINDOWS_WALLET_RECHARGE_TYPE), { message: '充值类型格式错误' })
    @Column({ name: 'recharge_type', nullable: false, comment: withComment('充值类型', enums.WINDOWS_WALLET_RECHARGE_TYPE) })
    rechargeType: string

    @ApiProperty({ description: '充值金额（绝对值，放大百万倍存储）', example: 1000000 })
    @IsNotEmpty({ message: '充值金额必填' })
    @Min(0, { message: '充值金额必须大于等于0' })
    @Column({ type: 'bigint', comment: '充值金额（绝对值，放大百万倍存储）', nullable: false, default: 0 })
    amount: number

    @ApiProperty({ description: '变动前余额（放大百万倍存储）', example: 0 })
    @Column({ type: 'bigint', name: 'before_balance', comment: '变动前余额（放大百万倍存储）', nullable: false, default: 0 })
    beforeBalance: number

    @ApiProperty({ description: '变动后余额（放大百万倍存储）', example: 0 })
    @Column({ type: 'bigint', name: 'after_balance', comment: '变动后余额（放大百万倍存储）', nullable: false, default: 0 })
    afterBalance: number

    @ApiProperty({ description: '备注', example: '人工后台加款' })
    @IsOptional()
    @Length(0, 1024, { message: '备注长度不能超过1024位' })
    @Column({ comment: '备注', length: 1024, nullable: true })
    remark: string
}
