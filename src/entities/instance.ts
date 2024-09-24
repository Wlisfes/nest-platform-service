import { tbUser } from '@/entities/tb-user'
import { tbMember } from '@/entities/tb-member'
import { tbSimple, tbSimplePostMember, tbSimpleRankMember } from '@/entities/tb-simple'
import { tbDept, tbDeptMember, tbDeptMaster } from '@/entities/tb-dept'

export { tbUser, tbMember, tbDept, tbDeptMember, tbDeptMaster, tbSimple, tbSimplePostMember, tbSimpleRankMember }
export const forEntities = [tbUser, tbMember, tbDept, tbDeptMember, tbDeptMaster, tbSimple, tbSimplePostMember, tbSimpleRankMember]
