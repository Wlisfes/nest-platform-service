import big from 'big.js'

/**金额存储倍率**/
export const AMOUNT_MAGNIFICATION = 1000000

/**
 * 数字相加 A + B
 * @param a 数字A
 * @param b 数字B
 */
export function fetchPlusNumber(a: any, b: any) {
    return new big(Number(a || 0)).plus(Number(b || 0)).toNumber()
}

/**
 * 数字相减 A - B
 * @param a 数字A
 * @param b 数字B
 */
export function fetchMinusNumner(a: any, b: any) {
    return new big(Number(a || 0)).minus(Number(b || 0)).toNumber()
}

/**
 * 数字相乘 A * B
 * @param a 数字A
 * @param b 数字B
 */
export function fetchTimesNumber(a: any, b: any) {
    return new big(Number(a || 0)).times(Number(b || 0)).toNumber()
}

/**
 * 数字相除 A / B
 * @param a 数字A
 * @param b 数字B
 */
export function fetchDivNumber(a: any, b: any) {
    return new big(Number(a || 0)).div(Number(b || 0)).toNumber()
}

/**
 * 正向转换：真实金额 → 存储金额（放大倍率）
 * @param value 真实金额
 * @param magnification 倍率，默认 AMOUNT_MAGNIFICATION
 */
export function fetchAmountEnlarge(value: any, magnification: number = AMOUNT_MAGNIFICATION) {
    return new big(Number(value || 0)).times(magnification).toNumber()
}

/**
 * 反向转换：存储金额 → 真实金额（缩小倍率）
 * @param value 存储金额
 * @param magnification 倍率，默认 AMOUNT_MAGNIFICATION
 */
export function fetchAmountRestore(value: any, magnification: number = AMOUNT_MAGNIFICATION) {
    return new big(Number(value || 0)).div(magnification).toNumber()
}
