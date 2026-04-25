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

export const CHUNK_CLIENT_CLASS = {
    name: '客户类型',
    value: 'CHUNK_CLIENT_CLASS',
    common: {
        value: 'common',
        name: '普通客户',
        json: { type: 'info' }
    },
    cooperate: {
        value: 'cooperate',
        name: '推广客户',
        json: { type: 'info' }
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

export const CHUNK_CLIENT_STAGE = {
    name: '阶段',
    value: 'CHUNK_CLIENT_STAGE',
    cluetrail: {
        value: 'cluetrail',
        name: '线索阶段',
        json: { type: 'info' }
    },
    intention: {
        value: 'intention',
        name: '意向阶段',
        json: { type: 'info' }
    },
    authenticate: {
        value: 'authenticate',
        name: '认证阶段',
        json: { type: 'info' }
    },
    testing: {
        value: 'testing',
        name: '测试阶段',
        json: { type: 'warning' }
    },
    charge: {
        value: 'charge',
        name: '充值阶段',
        json: { type: 'success' }
    },
    production: {
        value: 'production',
        name: '生产阶段',
        json: { type: 'success' }
    },
    cooperate: {
        value: 'cooperate',
        name: '价值阶段',
        json: { type: 'success' }
    }
}

export const CHUNK_CLIENT_SMS_STATUS = {
    name: '短信应用状态',
    value: 'CHUNK_CLIENT_SMS_STATUS',
    inactive: {
        value: 'inactive',
        name: '未激活',
        json: { type: 'default' }
    },
    active: {
        value: 'active',
        name: '已激活',
        json: { type: 'success' }
    },
    disable: {
        value: 'disable',
        name: '禁用',
        json: { type: 'error' }
    }
}

export const CHUNK_CLIENT_SMS_TYPE = {
    name: '短信应用类型',
    value: 'CHUNK_CLIENT_SMS_TYPE',
    otp: {
        value: 'otp',
        name: '验证码',
        json: { type: 'info' }
    },
    market: {
        value: 'market',
        name: '营销',
        json: { type: 'warning' }
    },
    notify: {
        value: 'notify',
        name: '通知',
        json: { type: 'success' }
    }
}
