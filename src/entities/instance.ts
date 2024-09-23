import { tbUser } from '@/entities/tb-user'
import { tbSimple } from '@/entities/tb-simple'
import { tbMember } from '@/entities/tb-member'
import { tbDept, tbDeptMember } from '@/entities/tb-dept'
import { tbPost, tbPostMember } from '@/entities/tb-post'

export { tbUser, tbSimple, tbMember, tbDept, tbDeptMember, tbPost, tbPostMember }
export const forEntities = [tbUser, tbSimple, tbMember, tbDept, tbDeptMember, tbPost, tbPostMember]
