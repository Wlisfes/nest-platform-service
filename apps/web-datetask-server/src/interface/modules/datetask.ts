import { ApiProperty, PickType, IntersectionType, PartialType } from '@nestjs/swagger'
import { OmixColumnOptions, OmixColumnResponse } from '@/interface'
import * as schema from '@/modules/database/schema'

/**注册系统任务定义（不存在则自动创建）**/
export class BaseEnsureSystemTaskOptions extends IntersectionType(
    PickType(schema.WindowsDatetask, ['taskName', 'handler', 'cron']),
    PartialType(PickType(schema.WindowsDatetask, ['comment', 'body']))
) {}

/**写入任务执行日志**/
export class BaseWriteTaskLogOptions extends IntersectionType(
    PickType(schema.WindowsDatetaskLog, ['taskId', 'taskName', 'startTime', 'endTime', 'duration', 'status', 'result']),
    PartialType(PickType(schema.WindowsDatetaskLog, ['error']))
) {}
