import { HttpException, HttpStatus, HttpExceptionOptions } from '@nestjs/common'
import { Omix, OmixHeaders } from '@/interface/instance.resolver'
import { create } from 'svg-captcha'
import * as utils from '@/utils/utils-common'

/**生成图形验证码**/
export async function fetchCommonCodexer({ width, height, preset }: Omix<{ width: number; height: number; preset?: string }>) {
    return await utils.fetchParameter({ sid: await utils.fetchIntNumber() }).then(async node => {
        const charPreset = preset ?? `ABCDEFGHJKLMNPQRSTUVWXYZ123456789`
        return Object.assign(node, create({ width, height, charPreset, fontSize: 40, size: 4, color: true, noise: 2, inverse: true }))
    })
}

/**日志聚合**/
export function fetchCompiler(headers: OmixHeaders = {}, log: Omix | string = {}) {
    const duration = headers.datetime ?? 0
    return {
        log,
        duration: utils.fetchCaseWherer(utils.isNotEmpty(duration), { value: `${Date.now() - Number(duration)}ms`, defaultValue: null }),
        context: headers.context
    }
}

/**条件捕获、异常抛出**/
export async function fetchCatchWherer(
    where: boolean,
    scope: Omix<{ message: string; code?: number; cause?: Omix<HttpExceptionOptions> }>
) {
    return await utils.fetchHandler(where, function () {
        throw new HttpException(scope.message, scope.code ?? HttpStatus.BAD_REQUEST, scope.cause)
    })
}

/**字段输出控制**/
export function fetchSelection(alias: string, fields: string[]) {
    return (fields ?? []).map(field => (utils.isNotEmpty(alias) ? `${alias}.${field}` : field))
}
