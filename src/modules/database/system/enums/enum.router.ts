/**菜单类型**/
export const COMMON_SYSTEM_ROUTER_TYPE = {
    router: {
        value: 'router',
        name: '菜单',
        json: { custom: false, type: 'info' }
    },
    button: {
        value: 'button',
        name: '按钮',
        json: { custom: false, type: 'warning' }
    },
    http: {
        value: 'http',
        name: '接口',
        json: { custom: false, type: 'primary' }
    }
}

/**接口类型**/
export const COMMON_SYSTEM_ROUTER_METHOD = {
    get: {
        value: 'get',
        name: 'GET',
        json: { custom: false, type: 'info' }
    },
    post: {
        value: 'post',
        name: 'POST',
        json: { custom: false, type: 'success' }
    }
}

/**菜单状态**/
export const COMMON_SYSTEM_ROUTER_STATUS = {
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
