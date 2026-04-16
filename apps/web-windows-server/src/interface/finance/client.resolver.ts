import { ApiProperty, PickType, IntersectionType, PartialType } from '@nestjs/swagger'
import { OmixColumnOptions, OmixColumnResponse } from '@/interface'
import * as schema from '@/modules/database/schema'

/**新增客户**/
export class CreateClientOptions extends PickType(schema.WindowsClient, [
    'name', 'alias', 'brandId', 'currency', 'email', 'phone',
    'status', 'payMode', 'authStatus', 'source', 'remark'
]) {}

/**编辑客户**/
export class UpdateClientOptions extends IntersectionType(
    PickType(schema.WindowsClient, ['keyId']),
    PickType(schema.WindowsClient, [
        'name', 'alias', 'brandId', 'currency', 'email', 'phone',
        'payMode', 'remark'
    ])
) {}

/**分页列表查询**/
export class ColumnClientOptions extends IntersectionType(
    PickType(OmixColumnOptions, ['page', 'size']),
    PartialType(PickType(schema.WindowsClient, ['name', 'status', 'brandId', 'currency', 'payMode', 'authStatus', 'source']))
) {}

/**分页列表响应**/
export class ColumnClientOptionsResponse extends OmixColumnResponse {
    @ApiProperty({ description: '列表数据', type: [schema.WindowsClient] })
    list: schema.WindowsClient[]
}

/**状态修改**/
export class UpdateClientStatusOptions extends PickType(schema.WindowsClient, ['keyId', 'status']) {}
