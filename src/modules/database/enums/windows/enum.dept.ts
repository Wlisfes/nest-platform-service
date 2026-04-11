/**管理端部门关联账号表**/
export const CHUNK_WINDOWS_DEPT_MEMBER = {
    name: '部门成员角色',
    value: 'CHUNK_WINDOWS_DEPT_MEMBER',
    admin: {
        value: 'admin',
        name: '管理员',
        json: { type: 'error' }
    },
    sub_admin: {
        value: 'sub_admin',
        name: '子管理员',
        json: { type: 'warning' }
    },
    member: {
        value: 'member',
        name: '普通成员',
        json: { type: 'info' }
    }
}
