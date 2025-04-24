/**字典状态说明**/
export const SCHEMA_CHUNK_STATUS_OPTIONS = {
    enable: {
        value: 'enable',
        name: '已启用',
        json: { custom: false, type: 'success' }
    },
    disable: {
        value: 'disable',
        name: '已禁用',
        json: { custom: false, type: 'warning' }
    }
}

/**动态字典类型说明**/
export const DYNAMIC_SCHEMA_CHUNK_OPTIONS = {}

/**静态字典类型说明**/
export const STATIC_SCHEMA_CHUNK_OPTIONS = {
    COMMON_SYSTEM_USER_STATUS: {
        value: 'COMMON_SYSTEM_USER_STATUS',
        name: '账号状态'
    },
    COMMON_SYSTEM_ROUTER_TYPE: {
        value: 'COMMON_SYSTEM_ROUTER_TYPE',
        name: '菜单类型'
    },
    COMMON_SYSTEM_ROUTER_STATUS: {
        value: 'COMMON_SYSTEM_ROUTER_STATUS',
        name: '菜单状态'
    },
    COMMON_SYSTEM_ROUTER_CHECK: {
        value: 'COMMON_SYSTEM_ROUTER_CHECK',
        name: '菜单显示状态'
    },
    COMMON_SYSTEM_ROLE_STATUS: {
        value: 'COMMON_SYSTEM_ROLE_STATUS',
        name: '角色状态'
    }
}
