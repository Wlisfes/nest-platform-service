import { ApiProperty, PickType, IntersectionType, PartialType } from '@nestjs/swagger'
import { OmixColumnOptions, OmixColumnResponse } from '@/interface'
import * as schema from '@/modules/database/schema'

/**系统任务分页列表查询**/
export class ColumnDatetaskOptions extends IntersectionType(
    PickType(OmixColumnOptions, ['page', 'size']),
    PartialType(PickType(schema.WindowsDatetask, ['taskName', 'status']))
) {}

/**系统任务分页列表响应**/
export class ColumnDatetaskOptionsResponse extends OmixColumnResponse {
    @ApiProperty({ description: '列表数据', type: [schema.WindowsDatetask] })
    list: schema.WindowsDatetask[]
}

/**任务详情**/
export class DatetaskPayloadOptions extends PickType(schema.WindowsDatetask, ['keyId']) {}

/**任务详情响应**/
export class DatetaskPayloadOptionsResponse extends schema.WindowsDatetask {}

/**切换任务状态**/
export class UpdateDatetaskStatusOptions extends PickType(schema.WindowsDatetask, ['taskId', 'status']) {}

/**修改Cron表达式**/
export class UpdateDatetaskCronOptions extends PickType(schema.WindowsDatetask, ['taskId', 'cron']) {}

/**手动触发系统任务**/
export class BaseSystemTriggerDatetaskOptions extends PickType(schema.WindowsDatetask, ['taskId']) {}

/**任务日志分页查询**/
export class ColumnDatetaskLogOptions extends IntersectionType(
    PickType(OmixColumnOptions, ['page', 'size']),
    PickType(schema.WindowsDatetaskLog, ['taskId']),
    PartialType(PickType(schema.WindowsDatetaskLog, ['status']))
) {}

/**任务日志分页响应**/
export class ColumnDatetaskLogOptionsResponse extends OmixColumnResponse {
    @ApiProperty({ description: '列表数据', type: [schema.WindowsDatetaskLog] })
    list: schema.WindowsDatetaskLog[]
}
