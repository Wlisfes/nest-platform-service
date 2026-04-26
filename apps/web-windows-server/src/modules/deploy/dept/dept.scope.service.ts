import { Injectable } from '@nestjs/common'
import { Logger, AutoDescriptor } from '@/modules/logger/logger.service'
import { DataBaseService, WindowsService, schema, enums } from '@/modules/database/database.service'
import { OmixRequest } from '@/interface'

/**数据权限范围结果**/
export interface DataScopeResult {
    /**可见用户UID列表，null表示全部可见**/
    uids: string[] | null
}

/**权限优先级：self_whole > dept_member > self_member > self**/
const MODEL_PRIORITY: Record<string, number> = {
    [enums.CHUNK_ROLE_MODEL.self.value]: 1,
    [enums.CHUNK_ROLE_MODEL.self_member.value]: 2,
    [enums.CHUNK_ROLE_MODEL.dept_member.value]: 3,
    [enums.CHUNK_ROLE_MODEL.self_whole.value]: 4
}

@Injectable()
export class DeployDeptScopeService extends Logger {
    constructor(private readonly database: DataBaseService, private readonly windows: WindowsService) {
        super()
    }

    /**
     * 解析当前用户的数据权限范围，返回可见的userId列表
     * @param request 请求上下文
     * @returns DataScopeResult { uids: string[] | null }
     *          uids为null表示全部可见，否则为可见userId数组
     */
    @AutoDescriptor
    public async fetchDataScopeUserIds(request: OmixRequest): Promise<DataScopeResult> {
        const uid = request.user.uid

        /**1. 查询用户直接关联的角色（非部门角色），取其model**/
        const directRoles = await this.database.builder(this.windows.roleOptions, async qb => {
            qb.where(
                `t.key_id IN (
                    SELECT ra.role_id FROM tb_windows_role_account ra WHERE ra.uid = :uid
                )`,
                { uid }
            )
            return await qb.getMany()
        })

        /**2. 查询用户在各部门中的成员角色，根据chunk推导有效数据权限**/
        const deptAccounts = await this.database.builder(this.windows.deptAccountOptions, async qb => {
            qb.where(`t.uid = :uid`, { uid })
            return await qb.getMany()
        })

        /**3. 收集所有有效model值**/
        const effectiveModels: string[] = directRoles.map(r => r.model)

        /**根据部门成员角色推导有效数据权限：
         * admin → dept_member（可看本部门及下属部门所有数据）
         * sub_admin → self_member（可看本人及下属数据）
         * member → self（仅本人数据）
         **/
        for (const da of deptAccounts) {
            if (da.chunk === enums.CHUNK_DEPT_MEMBER.admin.value) {
                effectiveModels.push(enums.CHUNK_ROLE_MODEL.dept_member.value)
            } else if (da.chunk === enums.CHUNK_DEPT_MEMBER.sub_admin.value) {
                effectiveModels.push(enums.CHUNK_ROLE_MODEL.self_member.value)
            } else {
                effectiveModels.push(enums.CHUNK_ROLE_MODEL.self.value)
            }
        }

        /**4. 取最高权限级别的model**/
        let maxModel = enums.CHUNK_ROLE_MODEL.self.value
        let maxPriority = MODEL_PRIORITY[maxModel]
        for (const model of effectiveModels) {
            const priority = MODEL_PRIORITY[model] ?? 0
            if (priority > maxPriority) {
                maxPriority = priority
                maxModel = model
            }
        }

        /**5. 根据最高权限model计算可见userId列表**/

        /**全部数据：不做过滤**/
        if (maxModel === enums.CHUNK_ROLE_MODEL.self_whole.value) {
            return { uids: null }
        }

        /**本部门及下属部门：查询用户所在部门 + 递归子部门的所有成员**/
        if (maxModel === enums.CHUNK_ROLE_MODEL.dept_member.value) {
            return await this.fetchDeptMemberScope(uid)
        }

        /**本人及下属：根据部门成员角色推导下属关系**/
        if (maxModel === enums.CHUNK_ROLE_MODEL.self_member.value) {
            return await this.fetchSelfMemberScope(uid)
        }

        /**本人数据**/
        return { uids: [uid] }
    }

    /**
     * 本部门及下属部门范围：查询用户所有部门 + 递归子部门 → 所有成员UID
     */
    private async fetchDeptMemberScope(uid: string): Promise<DataScopeResult> {
        /**查询用户所在的所有部门ID**/
        const deptAccounts = await this.database.builder(this.windows.deptAccountOptions, async qb => {
            qb.where(`t.uid = :uid`, { uid })
            return await qb.getMany()
        })
        const userDeptIds = deptAccounts.map(da => da.deptId)
        if (userDeptIds.length === 0) {
            return { uids: [uid] }
        }

        /**递归获取所有子部门ID**/
        const allDeptIds = await this.fetchAllChildDeptIds(userDeptIds)

        /**查询这些部门中的所有成员UID**/
        const members = await this.database.builder(this.windows.deptAccountOptions, async qb => {
            qb.where(`t.deptId IN (:...deptIds)`, { deptIds: allDeptIds })
            return await qb.getMany()
        })
        const uidSet = new Set(members.map(m => m.uid))
        uidSet.add(uid)
        return { uids: [...uidSet] }
    }

    /**
     * 本人及下属范围：根据用户在各部门的成员角色推导可见UID
     * - admin：可看该部门所有成员
     * - sub_admin：可看自己 + 该部门普通成员
     * - member：仅自己
     * 多部门取并集
     */
    private async fetchSelfMemberScope(uid: string): Promise<DataScopeResult> {
        /**查询用户在各部门的成员角色**/
        const deptAccounts = await this.database.builder(this.windows.deptAccountOptions, async qb => {
            qb.where(`t.uid = :uid`, { uid })
            return await qb.getMany()
        })
        if (deptAccounts.length === 0) {
            return { uids: [uid] }
        }

        const uidSet = new Set<string>([uid])

        for (const da of deptAccounts) {
            if (da.chunk === enums.CHUNK_DEPT_MEMBER.admin.value) {
                /**管理员：查该部门所有成员**/
                const members = await this.database.builder(this.windows.deptAccountOptions, async qb => {
                    qb.where(`t.deptId = :deptId`, { deptId: da.deptId })
                    return await qb.getMany()
                })
                members.forEach(m => uidSet.add(m.uid))
            } else if (da.chunk === enums.CHUNK_DEPT_MEMBER.sub_admin.value) {
                /**子管理员：查该部门自己 + 普通成员**/
                const members = await this.database.builder(this.windows.deptAccountOptions, async qb => {
                    qb.where(`t.deptId = :deptId`, { deptId: da.deptId })
                    qb.andWhere(`(t.uid = :uid OR t.chunk = :memberChunk)`, {
                        uid,
                        memberChunk: enums.CHUNK_DEPT_MEMBER.member.value
                    })
                    return await qb.getMany()
                })
                members.forEach(m => uidSet.add(m.uid))
            }
            /**普通成员：不增加额外可见UID**/
        }

        return { uids: [...uidSet] }
    }

    /**
     * 递归获取指定部门ID列表及其所有子部门ID
     */
    private async fetchAllChildDeptIds(parentDeptIds: number[]): Promise<number[]> {
        const allIds = new Set<number>(parentDeptIds)
        let currentIds = [...parentDeptIds]

        while (currentIds.length > 0) {
            const childDepts = await this.database.builder(this.windows.deptOptions, async qb => {
                qb.where(`t.pid IN (:...pids)`, { pids: currentIds })
                return await qb.getMany()
            })
            const newIds = childDepts.map(d => d.keyId).filter(id => !allIds.has(id))
            newIds.forEach(id => allIds.add(id))
            currentIds = newIds
        }

        return [...allIds]
    }
}
