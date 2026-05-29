import { PickType, IntersectionType, PartialType, ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
import { BaseRpcPayload } from '@/interface'
import * as schema from '@/modules/database/schema'

/**任务执行数据结构定义**/
export class BaseJobDatetaskOptions extends IntersectionType(
    PickType(schema.WindowsDatetask, ['taskId', 'taskName', 'handler', 'cron']),
    PickType(schema.WindowsDatetask, ['status', 'body', 'comment'])
) {}

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

/**手动触发任务定义**/
export class BaseTriggerTaskOptions extends IntersectionType(BaseRpcPayload, PickType(schema.WindowsDatetask, ['taskId'])) {}

/**启用系统任务定义**/
export class BaseEnableSystemTaskOptions extends IntersectionType(BaseRpcPayload, PickType(schema.WindowsDatetask, ['taskId'])) {}

/**停用系统任务定义**/
export class BaseDisableSystemTaskOptions extends IntersectionType(BaseRpcPayload, PickType(schema.WindowsDatetask, ['taskId'])) {}

/**修改系统任务Cron表达式定义**/
export class BaseUpdateSystemTaskCronOptions extends IntersectionType(
    BaseRpcPayload,
    PickType(schema.WindowsDatetask, ['taskId', 'cron'])
) {}
