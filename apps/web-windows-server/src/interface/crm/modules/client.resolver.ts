import { ApiProperty, PickType, IntersectionType, PartialType } from '@nestjs/swagger'
import { OmixColumnOptions, OmixColumnResponse } from '@/interface'
import * as schema from '@/modules/database/schema'

/**销售管理-我的客户-分页列表查询**/
export class BaseCrmClientCommonConsumerOptions extends IntersectionType(
    PickType(OmixColumnOptions, ['page', 'size']),
    PartialType(PickType(schema.WindowsClient, ['name', 'status', 'brandId', 'currency', 'payMode', 'authStatus', 'source']))
) {}

/**分页列表响应**/
export class BaseCrmClientCommonConsumerOptionsResponse extends OmixColumnResponse {
    @ApiProperty({ description: '列表数据', type: [schema.WindowsClient] })
    list: schema.WindowsClient[]
}

/**销售管理-我的客户-客户详情**/
export class BaseCrmClientResolverOptions extends PickType(schema.WindowsClient, ['keyId']) {}

/**客户详情响应**/
export class BaseCrmClientResolverOptionsResponse extends schema.WindowsClient {}
