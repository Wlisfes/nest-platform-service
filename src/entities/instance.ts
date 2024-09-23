import { tbUser } from '@/entities/tb-user'
import { tbMember } from '@/entities/tb-member'
import { tbDept, tbDeptMember } from '@/entities/tb-dept'
import { tbPost, tbPostMember } from '@/entities/tb-post'

export { tbUser, tbMember, tbDept, tbDeptMember, tbPost }
export const forEntities = [tbUser, tbMember, tbDept, tbDeptMember, tbPost, tbPostMember]
