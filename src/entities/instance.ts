import { tbUser } from '@/entities/tb-user'
import { tbMember } from '@/entities/tb-member'
import { tbSimple, tbSimplePostMember, tbSimpleRankMember } from '@/entities/tb-simple'
import { tbDept, tbDeptMember } from '@/entities/tb-dept'
import { tbRouter } from '@/entities/tb-router'

export { tbUser, tbMember, tbDept, tbDeptMember, tbSimple, tbSimplePostMember, tbSimpleRankMember, tbRouter }
export const forEntities = [tbUser, tbMember, tbDept, tbDeptMember, tbSimple, tbSimplePostMember, tbSimpleRankMember, tbRouter]
