import { Entity, Column } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsMobile } from '@/decorator'
import { Type } from 'class-transformer'
import { IsNotEmpty, Length, IsEmail, IsEnum, IsOptional } from 'class-validator'
import { DataBaseAdapter, DataBaseByAdapter, withKeys, withComment } from '@/modules/database/database.adapter'
import * as enums from '@/modules/database/enums'

@Entity({ name: 'tb_sms_app_tasks', comment: '客户短信任务表' })
export class TbSmsAppTasks extends DataBaseAdapter {
    @ApiProperty({ description: '客户ID', example: 1008600 })
    @IsNotEmpty({ message: '客户ID必填' })
    @Column({ name: 'client_id', comment: '客户ID', nullable: false })
    clientId: number
}
