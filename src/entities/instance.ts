import { tbUser } from '@/entities/tb-user'
import { tbMember } from '@/entities/tb-member'
import { tbDept, tbDeptMember } from '@/entities/tb-dept'

export { tbUser, tbMember, tbDept, tbDeptMember }
export const forEntities = [tbUser, tbMember, tbDept, tbDeptMember]
