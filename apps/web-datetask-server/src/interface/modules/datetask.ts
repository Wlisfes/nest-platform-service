import { PickType, IntersectionType, PartialType } from '@nestjs/swagger'
import * as schema from '@/modules/database/schema'

/**处理器注册表类型**/
export type TaskHandler = (params: Omix) => Promise<Omix>

/**任务执行数据结构定义**/
export class BaseJobDatetaskOptions extends IntersectionType(
    PickType(schema.WindowsDatetask, ['taskId', 'taskName', 'handler', 'type', 'cron']),
    PickType(schema.WindowsDatetask, ['runTime', 'status', 'body', 'comment'])
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
export class BaseTriggerTaskOptions extends PickType(schema.WindowsDatetask, ['taskId']) {}

/**启用系统任务定义**/
export class BaseEnableSystemTaskOptions extends PickType(schema.WindowsDatetask, ['taskId']) {}

/**停用系统任务定义**/
export class BaseDisableSystemTaskOptions extends PickType(schema.WindowsDatetask, ['taskId']) {}

/**修改系统任务Cron表达式定义**/
export class BaseUpdateSystemTaskCronOptions extends PickType(schema.WindowsDatetask, ['taskId', 'cron']) {}
