export const CHUNK_WINDOWS_ROLE_CHUNK = {
    name: '角色类型',
    value: 'CHUNK_WINDOWS_ROLE_CHUNK',
    common: {
        value: 'common',
        name: '通用角色',
        json: { type: 'success' }
    },
    department: {
        value: 'department',
        name: '部门角色',
        json: { type: 'info' }
    }
}

export const CHUNK_WINDOWS_ROLE_MODEL = {
    name: '角色数据权限',
    value: 'CHUNK_WINDOWS_ROLE_MODEL',
    self: {
        value: 'self',
        name: '本人',
        json: { type: 'success' }
    },
    self_member: {
        value: 'self_member',
        name: '本人及下属',
        json: { type: 'info' }
    },
    dept_member: {
        value: 'dept_member',
        name: '本部门及下属部门',
        json: { type: 'info' }
    },
    self_whole: {
        value: 'self_whole',
        name: '全部',
        json: { type: 'info' }
    }
}
