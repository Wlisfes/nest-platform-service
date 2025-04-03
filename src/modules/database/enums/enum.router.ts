/**菜单类型**/
export const COMMON_SYSTEM_ROUTER_TYPE = {
    router: {
        value: 'router',
        name: '菜单',
        json: { type: 'info' }
    },
    button: {
        value: 'button',
        name: '按钮',
        json: { type: 'warning' }
    }
}

/**菜单状态**/
export const COMMON_SYSTEM_ROUTER_STATUS = {
    enable: {
        value: 'enable',
        name: '已启用',
        json: { type: 'success' }
    },
    disable: {
        value: 'disable',
        name: '已禁用',
        json: { type: 'error' }
    }
}
