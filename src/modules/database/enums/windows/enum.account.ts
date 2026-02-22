/**管理端账号表**/
export const CHUNK_WINDOWS_ACCOUNT_STATUS = {
    name: '账号状态',
    value: 'CHUNK_WINDOWS_ACCOUNT_STATUS',
    online: {
        value: 'online',
        name: '在职',
        json: { type: 'success' }
    },
    offline: {
        value: 'offline',
        name: '离职',
        json: { type: 'error' }
    }
}
