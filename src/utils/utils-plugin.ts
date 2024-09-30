import { HttpException, HttpStatus } from '@nestjs/common'
import { create } from 'svg-captcha'
import { ConsumeMessage } from 'amqplib'
import { createCanvas } from 'canvas'
import { divineHandler, divineIntNumber } from '@/utils/utils-common'
import { Omix, OmixHeaders } from '@/interface/instance.resolver'
import * as web from '@/config/web-instance'
import * as crypto from 'crypto'
import * as stream from 'stream'
import * as sizeOf from 'image-size'
import * as pdfjsLib from 'pdfjs-dist'

/**生成图形验证码**/
export async function divineGraphCodex(scope: Omix<{ width: number; height: number }>) {
    return {
        sid: divineIntNumber(),
        ...create({
            fontSize: 40,
            size: 4,
            color: true,
            noise: 2,
            inverse: true,
            charPreset: 'ABCDEFGHJKLMNPQRSTUVWXYZ123456789',
            ...scope
        })
    }
}

/**Buffer转换Stream**/
export function divineBufferToStream(buffer: Buffer): Promise<stream.PassThrough> {
    return new Promise(resolve => {
        const fileStream = new stream.PassThrough()
        fileStream.end(buffer)
        return resolve(fileStream)
    })
}

/**Stream转换Buffer**/
export function divineStreamToBuffer(streamFile): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const buffers = []
        streamFile.on('error', reject)
        streamFile.on('data', data => buffers.push(data))
        streamFile.on('end', () => resolve(Buffer.concat(buffers)))
    })
}

/**获取自定义请求头**/
export async function divineCustomizeHeaders(consume: ConsumeMessage) {
    if (consume.properties.messageId) {
        return {
            [web.WEB_COMMON_HEADER_STARTTIME]: Date.now(),
            [web.WEB_COMMON_HEADER_CONTEXTID]: consume.properties.messageId
        } as never as OmixHeaders
    }
    return {
        [web.WEB_COMMON_HEADER_STARTTIME]: Date.now(),
        [web.WEB_COMMON_HEADER_CONTEXTID]: divineIntNumber({ random: true, bit: 32 })
    } as never as OmixHeaders
}
