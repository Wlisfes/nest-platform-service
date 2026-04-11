import { ApiProperty, PickType, IntersectionType, PartialType } from '@nestjs/swagger'
import { OmixColumnOptions, OmixPayloadOptions } from '@/interface'
import { WindowsAccount, WindowsSheet } from '@/modules/database/schema'

/**账户登录**/
export class AccountTokenOptions extends IntersectionType(
    PickType(WindowsAccount, ['number', 'password']),
    PickType(OmixPayloadOptions, ['code'])
) {}

/**登录/续时响应**/
export class AccountTokenResponse {
    @ApiProperty({ description: 'token令牌', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
    token: string

    @ApiProperty({ description: '过期时间', example: 7200 })
    expires: number
}

/**登录账户信息响应**/
export class AccountTokenResolverResponse extends WindowsAccount {}

/**账户权限菜单响应**/
export class AccountTokenResourceResponse {
    @ApiProperty({ description: '菜单树列表', type: [WindowsSheet] })
    list: WindowsSheet[]
}

/**账户权限按钮响应**/
export class AccountTokenSheetResponse extends WindowsAccount {}
