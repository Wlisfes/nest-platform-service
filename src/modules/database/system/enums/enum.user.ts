/**账号状态**/
export const COMMON_SYSTEM_USER_STATUS = {
    enable: {
        value: 'enable',
        name: '启用',
        json: { custom: false, type: 'success' }
    },
    disable: {
        value: 'disable',
        name: '禁用',
        json: { custom: false, type: 'error' }
    },
    suspend: {
        value: 'suspend',
        name: '挂起',
        json: { custom: false, type: 'warning' }
    }
}
