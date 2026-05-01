export const WINDOWS_WALLET_CHANGE_TYPE = {
    name: '钱包扣费类型',
    value: 'WINDOWS_WALLET_CHANGE_TYPE',
    sms: {
        value: 'sms',
        name: '短信',
        json: { type: 'success' }
    },
    email: {
        value: 'email',
        name: '邮件',
        json: { type: 'warning' }
    },
    whatsapp: {
        value: 'whatsapp',
        name: 'WhatsApp',
        json: { type: 'info' }
    }
}

export const WINDOWS_WALLET_BILL_TYPE = {
    name: '账单交易类型',
    value: 'WINDOWS_WALLET_BILL_TYPE',
    deduct: {
        value: 'deduct',
        name: '扣费',
        json: { type: 'warning' }
    },
    refund: {
        value: 'refund',
        name: '退款',
        json: { type: 'success' }
    }
}

export const WINDOWS_WALLET_RECHARGE_TYPE = {
    name: '钱包充值类型',
    value: 'WINDOWS_WALLET_RECHARGE_TYPE',
    system: {
        value: 'system',
        name: '系统加款',
        json: { type: 'success' }
    },
    bank: {
        value: 'bank',
        name: '对公转账',
        json: { type: 'info' }
    },
    alipay: {
        value: 'alipay',
        name: '支付宝',
        json: { type: 'info' }
    }
}
