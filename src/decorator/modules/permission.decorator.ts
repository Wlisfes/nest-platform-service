import { SetMetadata } from '@nestjs/common'

export const APP_REQUIRE_PERMISSION_CONTEXT = `APP_REQUIRE_PERMISSION_CONTEXT`

export const RequirePermission = (...keys: string[]) => {
    return SetMetadata(APP_REQUIRE_PERMISSION_CONTEXT, keys)
}
