import { ApiProperty, PickType, IntersectionType, PartialType } from '@nestjs/swagger'
import { OmixColumnOptions, OmixColumnResponse } from '@/interface'
import * as schema from '@/modules/database/schema'

/**销售管理-我的客户-分页列表查询**/
export class BaseCrmClientCommonConsumerOptions extends IntersectionType(
    PickType(OmixColumnOptions, ['page', 'size']),
    PartialType(PickType(schema.WindowsClient, ['name', 'status', 'brandId', 'currency', 'payMode', 'authStatus', 'source']))
) {}
