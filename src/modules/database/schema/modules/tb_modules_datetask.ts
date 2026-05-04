import { Entity, Column } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, Length, IsEnum, IsOptional } from 'class-validator'
import { DataBaseAdapter, WithJsonColumn, DateWithColumn, withKeys, withComment } from '@/modules/database/database.adapter'
import * as enums from '@/modules/database/enums'

@Entity({ name: 'tb_windows_datetask', comment: '定时任务定义表' })
export class WindowsDatetask extends DataBaseAdapter {
    @ApiProperty({ description: '任务ID', example: '2149446185344106496' })
    @IsNotEmpty({ message: '任务ID必填' })
    @Column({ name: 'task_id', comment: '任务ID', update: false, length: 19, nullable: false })
    taskId: string

    @ApiProperty({ description: '任务名称', example: '汇率同步定时任务' })
    @IsNotEmpty({ message: '任务名称必填' })
    @Length(4, 128, { message: '任务名称长度4~128位' })
    @Column({ name: 'task_name', comment: '任务名称', length: 128, nullable: false, unique: true })
    taskName: string

    @ApiProperty({ description: '处理器标识', example: 'datetask-sync-exchange-rate' })
    @IsNotEmpty({ message: '处理器标识必填' })
    @Length(1, 64, { message: '处理器标识长度1~64位' })
    @Column({ comment: '处理器标识', length: 64, nullable: false })
    handler: string

    @ApiProperty({ description: '任务描述', example: '每天从Frankfurter API同步汇率' })
    @IsOptional()
    @Length(0, 256, { message: '任务描述长度不能超过256' })
    @Column({ comment: '任务描述', length: 256, nullable: true })
    comment: string

    @ApiProperty({
        description: withComment('任务类型', enums.CHUNK_DATETASK_TYPE),
        example: enums.CHUNK_DATETASK_TYPE.system.value
    })
    @IsNotEmpty({ message: '任务类型必填' })
    @IsEnum(withKeys(enums.CHUNK_DATETASK_TYPE), { message: '任务类型格式错误' })
    @Column({ nullable: false, comment: withComment('任务类型', enums.CHUNK_DATETASK_TYPE) })
    type: string

    @ApiProperty({ description: 'Cron表达式（周期任务）', example: '0 0 8 * * *', required: false })
    @IsOptional()
    @Length(1, 32, { message: 'Cron表达式长度1~32位' })
    @Column({ comment: 'Cron表达式', length: 32, nullable: true })
    cron: string

    @ApiProperty({ description: '一次性执行时间（一次性任务）', example: '2025-06-01 08:00:00', required: false })
    @IsOptional()
    @Column({ name: 'run_time', type: 'datetime', comment: '一次性执行时间', nullable: true })
    runTime: Date

    @ApiProperty({ description: withComment('任务状态', enums.CHUNK_DATETASK_STATUS), example: enums.CHUNK_DATETASK_STATUS.running.value })
    @IsNotEmpty({ message: '任务状态必填' })
    @IsEnum(withKeys(enums.CHUNK_DATETASK_STATUS), { message: '任务状态格式错误' })
    @Column({ nullable: false, comment: withComment('任务状态', enums.CHUNK_DATETASK_STATUS) })
    status: string

    @ApiProperty({ description: '任务参数', required: false })
    @IsOptional()
    @WithJsonColumn({ comment: '任务参数', nullable: true })
    body: Record<string, any>

    @ApiProperty({ description: '上次执行时间', example: '2025-05-03 08:00:00' })
    @DateWithColumn(Column, { name: 'last_time', comment: '上次执行时间', nullable: true })
    lastTime: Date

    @ApiProperty({ description: '下次执行时间', example: '2025-05-04 08:00:00' })
    @DateWithColumn(Column, { name: 'next_time', comment: '下次执行时间', nullable: true })
    nextTime: Date
}

@Entity({ name: 'tb_windows_datetask_log', comment: '定时任务执行日志表' })
export class WindowsDatetaskLog extends DataBaseAdapter {
    @ApiProperty({ description: '任务ID', example: '2149446185344106496' })
    @IsNotEmpty({ message: '任务ID必填' })
    @Column({ name: 'task_id', comment: '任务ID', update: false, length: 19, nullable: false })
    taskId: string

    @ApiProperty({ description: '任务名称', example: '汇率同步定时任务' })
    @IsNotEmpty({ message: '任务名称必填' })
    @Length(4, 128, { message: '任务名称长度4~128位' })
    @Column({ name: 'task_name', comment: '任务名称', length: 128, nullable: false })
    taskName: string

    @ApiProperty({ description: '开始时间', example: '2025-05-03 08:00:00' })
    @DateWithColumn(Column, { name: 'start_time', comment: '开始时间', nullable: false })
    startTime: Date

    @ApiProperty({ description: '结束时间', example: '2025-05-03 08:00:05' })
    @DateWithColumn(Column, { name: 'end_time', comment: '结束时间', nullable: true })
    endTime: Date

    @ApiProperty({ description: '耗时(ms)', example: 5000 })
    @Column({ comment: '耗时(ms)', nullable: true })
    duration: number

    @ApiProperty({
        description: withComment('执行状态', enums.CHUNK_DATETASK_LOG_STATUS),
        example: enums.CHUNK_DATETASK_LOG_STATUS.success.value
    })
    @IsNotEmpty({ message: '执行状态必填' })
    @IsEnum(withKeys(enums.CHUNK_DATETASK_LOG_STATUS), { message: '执行状态格式错误' })
    @Column({ nullable: false, comment: withComment('执行状态', enums.CHUNK_DATETASK_LOG_STATUS) })
    status: string

    @ApiProperty({ description: '结果摘要', required: false })
    @IsOptional()
    @WithJsonColumn({ comment: '结果摘要', nullable: true })
    result: Record<string, any>

    @ApiProperty({ description: '错误信息', required: false })
    @IsOptional()
    @WithJsonColumn({ comment: '错误信息', nullable: true })
    error: Record<string, any>
}
