import { PickType, IntersectionType, PartialType } from '@nestjs/swagger'
import { OmixColumnOptions, OmixColumnMergeOptions } from '@/interface'
import { schema } from '@/modules/database/database.service'

/**报价查询-分页列表查询**/
export class SmsSaturationColumnOptions extends IntersectionType(
    OmixColumnOptions,
    PartialType(PickType(schema.TbSmsApp, ['appAlias'])),
    PartialType(PickType(schema.WindowsClient, ['alias'])),
    PartialType(PickType(schema.TbSmsAppFormosan, ['clientId', 'appId', 'mcc', 'code', 'status']))
) {}

/**报价查询-分页列表响应**/
export class SmsSaturationColumnOptionsResponse extends OmixColumnMergeOptions(schema.TbSmsAppFormosan) {}
