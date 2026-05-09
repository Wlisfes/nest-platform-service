export const CHUNK_DATETASK_TYPE = {
    name: '任务类型',
    value: 'CHUNK_DATETASK_TYPE',
    system: {
        value: 'system',
        name: '系统任务',
        json: { type: 'info' }
    },
    sms: {
        value: 'sms',
        name: '短信任务',
        json: { type: 'warning' }
    }
}

export const CHUNK_DATETASK_STATUS = {
    name: '任务状态',
    value: 'CHUNK_DATETASK_STATUS',
    stop: {
        value: 'stop',
        name: '停止',
        json: { type: 'error' }
    },
    wait: {
        value: 'wait',
        name: '等待运行',
        json: { type: 'info' }
    },
    running: {
        value: 'running',
        name: '运行中',
        json: { type: 'success' }
    },
    finish: {
        value: 'finish',
        name: '已完成',
        json: { type: 'success' }
    }
}

export const CHUNK_DATETASK_LOG_STATUS = {
    name: '执行状态',
    value: 'CHUNK_DATETASK_LOG_STATUS',
    running: {
        value: 'running',
        name: '执行中',
        json: { type: 'info' }
    },
    success: {
        value: 'success',
        name: '成功',
        json: { type: 'success' }
    },
    failed: {
        value: 'failed',
        name: '失败',
        json: { type: 'error' }
    }
}
