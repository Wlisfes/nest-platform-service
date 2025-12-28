export const CHUNK_WINDOWS_RESOUREC_STATUS = {
    name: '菜单状态',
    value: 'CHUNK_WINDOWS_RESOUREC_STATUS',
    enable: {
        value: 'enable',
        name: '启用',
        json: { type: 'success' }
    },
    disable: {
        value: 'disable',
        name: '禁用',
        json: { type: 'error' }
    }
}

/**菜单是否可见**/
export const CHUNK_WINDOWS_RESOUREC_CHECK = {
    show: {
        value: 'show',
        name: '显示',
        json: { type: 'success' }
    },
    hide: {
        value: 'hide',
        name: '隐藏',
        json: { type: 'error' }
    }
}

/**管理端-操作按钮权限表**/
export const COMMON_WINDOWS_RESOUREC_SHEET = {
    /**按钮状态**/
    status: {
        enable: {
            value: 'enable',
            name: '启用',
            json: { type: 'success' }
        },
        disable: {
            value: 'disable',
            name: '禁用',
            json: { type: 'error' }
        }
    }
}

/**管理端-接口权限表**/
export const COMMON_WINDOWS_RESOUREC_APIFOX = {
    /**接口状态**/
    status: {
        enable: {
            value: 'enable',
            name: '启用',
            json: { type: 'success' }
        },
        disable: {
            value: 'disable',
            name: '禁用',
            json: { type: 'error' }
        }
    },
    /**接口请求类型**/
    method: {
        get: {
            value: 'get',
            name: 'GET',
            json: { type: 'info' }
        },
        post: {
            value: 'post',
            name: 'POST',
            json: { type: 'success' }
        }
    }
}
