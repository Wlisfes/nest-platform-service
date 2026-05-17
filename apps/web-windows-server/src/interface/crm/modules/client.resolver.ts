import { ApiProperty, PickType, IntersectionType, PartialType } from '@nestjs/swagger'
import { OmixColumnOptions, OmixColumnResponse } from '@/interface'
import { enums, schema } from '@/modules/database/database.service'

/**生成C端客户账号别名**/
export interface UtilsNewClientAliasOptions extends Omix {
    /**归属人ID**/
    userId: string
    /**归属人工号**/
    number: string
    /**品牌**/
    brandId: number
}

/**生成C端客户短信应用别名**/
export interface UtilsNewClientSmsAliasOptions extends Omix {
    /**客户ID**/
    clientId: number
    /**应用类型**/
    type: OmixEnumValues<typeof enums.CHUNK_CLIENT_SMS_TYPE>
}

/**销售管理-我的客户-新增客户**/
export class BaseCrmClientCommonCreateOptions extends IntersectionType(
    PickType(schema.WindowsClient, ['name', 'brandId', 'currency', 'email', 'payMode', 'remark']),
    PartialType(PickType(schema.WindowsClient, ['phone']))
) {}

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

/**客户短信应用-分页列表查询**/
export class BaseCrmClientSmsColumnOptions extends IntersectionType(
    PickType(OmixColumnOptions, ['page', 'size']),
    PickType(schema.TbSmsApp, ['clientId']),
    PartialType(PickType(schema.TbSmsApp, ['status', 'type', 'appAlias']))
) {}

/**客户短信应用-分页列表响应**/
export class BaseCrmClientSmsColumnOptionsResponse extends OmixColumnResponse {
    @ApiProperty({ description: '列表数据', type: [schema.TbSmsApp] })
    list: schema.TbSmsApp[]
}

/**客户短信应用-新增**/
export class BaseCrmClientSmsCreateOptions extends IntersectionType(
    PickType(schema.TbSmsApp, ['clientId', 'type']),
    PartialType(PickType(schema.TbSmsApp, ['pushUrl', 'remark']))
) {}
