import { PickType, IntersectionType } from '@nestjs/swagger'
import { OmixColumnPayload, OmixPayload } from '@/interface/instance.resolver'
import { tbMember } from '@/entities/instance'

/**员工账号登录**/
export class BodyAuthMember extends IntersectionType(PickType(tbMember, ['jobNumber', 'password']), PickType(OmixPayload, ['code'])) {}

/**创建员工账号**/
export class BodyCreateMember extends PickType(tbMember, ['name', 'jobNumber']) {}

/**员工账号列表**/
export class BodyColumnMember extends IntersectionType(OmixColumnPayload) {}

export class RestMember extends tbMember {}
