export const CHUNK_CLIENT_STATUS = {
    name: '客户状态',
    value: 'CHUNK_CLIENT_STATUS',
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

export const CHUNK_CLIENT_PAY_MODE = {
    name: '付款模式',
    value: 'CHUNK_CLIENT_PAY_MODE',
    prepaid: {
        value: 'prepaid',
        name: '预付',
        json: { type: 'info' }
    },
    postpaid: {
        value: 'postpaid',
        name: '后付',
        json: { type: 'warning' }
    }
}

export const CHUNK_CLIENT_AUTH_STATUS = {
    name: '认证状态',
    value: 'CHUNK_CLIENT_AUTH_STATUS',
    unverified: {
        value: 'unverified',
        name: '未认证',
        json: { type: 'default' }
    },
    pending: {
        value: 'pending',
        name: '认证中',
        json: { type: 'warning' }
    },
    verified: {
        value: 'verified',
        name: '已认证',
        json: { type: 'success' }
    },
    rejected: {
        value: 'rejected',
        name: '认证失败',
        json: { type: 'error' }
    }
}

export const CHUNK_CLIENT_SOURCE = {
    name: '注册来源',
    value: 'CHUNK_CLIENT_SOURCE',
    platform: {
        value: 'platform',
        name: '平台注册',
        json: { type: 'info' }
    },
    manual: {
        value: 'manual',
        name: '手动创建',
        json: { type: 'success' }
    }
}
