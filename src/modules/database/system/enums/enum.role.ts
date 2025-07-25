/**角色状态**/
export const COMMON_SYSTEM_ROLE_STATUS = {
    enable: {
        value: 'enable',
        name: '启用',
        json: { custom: false, type: 'success' }
    },
    disable: {
        value: 'disable',
        name: '禁用',
        json: { custom: false, type: 'error' }
    }
}

/**角色数据权限**/
export const COMMON_SYSTEM_ROLE_MODEL = {
    self: {
        value: 'self',
        name: '本人',
        json: { custom: false, type: 'success' }
    },
    self_member: {
        value: 'self_member',
        name: '本人及下属',
        json: { custom: false, type: 'success' }
    },
    dept: {
        value: 'dept',
        name: '本部门',
        json: { custom: false, type: 'success' }
    },
    dept_member: {
        value: 'dept_member',
        name: '本部门及下属部门',
        json: { custom: false, type: 'success' }
    },
    entire: {
        value: 'entire',
        name: '全部',
        json: { custom: false, type: 'success' }
    }
}
