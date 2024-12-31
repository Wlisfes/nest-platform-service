import { Omix } from '@/interface/instance.resolver'
import { create } from 'svg-captcha'
import * as utils from '@/utils/utils-common'

/**生成图形验证码**/
export async function fetchCommonCodexer({ width, height, preset }: Omix<{ width: number; height: number; preset?: string }>) {
    return await utils.fetchParameter({ sid: await utils.fetchIntNumber() }).then(async node => {
        const charPreset = preset ?? `ABCDEFGHJKLMNPQRSTUVWXYZ123456789`
        return Object.assign(node, create({ width, height, charPreset, fontSize: 40, size: 4, color: true, noise: 2, inverse: true }))
    })
}
