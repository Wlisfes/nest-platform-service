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
    }
}

/**菜单状态**/
export const COMMON_SYSTEM_ROUTER_STATUS = {
    enable: {
        value: 'enable',
        name: '已启用',
        json: { custom: false, type: 'success' }
    },
    disable: {
        value: 'disable',
        name: '已禁用',
        json: { custom: false, type: 'error' }
    }
}
